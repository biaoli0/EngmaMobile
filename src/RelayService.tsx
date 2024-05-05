import { Event, Relay } from 'nostr-tools';
import { v2 } from './utils/encryption';
import { getSignedEvent } from './utils/getSignedEvent';
import { getLocalPrivKey, getPubKey } from './constants';
import { NewContact } from './types';

const relayUrl = 'wss://relay.damus.io';

export const KINDS = {
  PROFILE: 2,
  FOLLOW_LIST: 3,
  DIRECT_MESSAGE: 4,
};

let relay: Relay;
let relayService: RelayService;

export const getRelayService = async () => {
  if (!relay || !relay.connected) {
    console.log('connecting to relay');
    try {
      relay = await Relay.connect(relayUrl);
    } catch (e) {
      throw new Error('Error on connecting to relay');
    }
  }

  if (!relayService) {
    console.log('initializing relay service');

    const privateKey = await getLocalPrivKey();
    const publicKey = getPubKey(privateKey);
    relayService = new RelayService(privateKey, publicKey, relay);
    await relayService.subscribeToMySelf();
  }

  return relayService;
};

type FollowList = Record<string, { name: string }>;

export class RelayService {
  private relay: Relay;
  private privateKey: string;
  private publicKey: string;
  private followList: FollowList = {};
  private name: string;

  constructor(privateKey: string, publicKey: string, relay: Relay) {
    this.relay = relay;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  private async getConversationKey() {
    return v2.utils.getConversationKey(this.privateKey, this.publicKey);
  }

  public getPublicKey() {
    return this.publicKey;
  }

  public getFollowList() {
    return this.followList;
  }

  public async updateProfile(newName: string) {
    console.log('update profile');
    await this.publishEvent('profile', KINDS.PROFILE, [['name', newName]]);
  }

  async subscribeToMySelf() {
    const filter = { authors: [this.publicKey], kinds: [KINDS.PROFILE, KINDS.FOLLOW_LIST] };
    console.log('subscribe to myself');
    await this.subscribeToEvent(filter, (event: Event) => {
      const { kind, content: encryptedContent, id, tags } = event || {};
      if (kind === KINDS.PROFILE) {
        const [, myName] = tags[0];
        this.name = myName;
      }

      if (kind === KINDS.FOLLOW_LIST) {
        const trimmedTags = tags.filter((tag) => {
          return tag[0] === 'p';
        });

        trimmedTags.forEach((tag) => {
          const [, publicKey, , name] = tag;
          this.followList[publicKey] = { name };
        });
      }
    });
  }

  async getUserFollowList(publicKey: string, onChange: (params?: any) => void) {
    const filter = { authors: [publicKey], kinds: [KINDS.FOLLOW_LIST] };
    await this.subscribeToEvent(filter, onChange);
  }

  async addUserToFollowList(newContact: NewContact) {
    this.followList[newContact.publicKey] = { name: newContact.name };
    const tags = Object.entries(this.followList).map(([publicKey, { name }]) => {
      return ['p', publicKey, relayUrl, name];
    });

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  async removeUserFromFollowList(newContact: NewContact) {
    delete this.followList[newContact.publicKey];
    const tags = Object.entries(this.followList).map(([publicKey, { name }]) => {
      return ['p', publicKey, relayUrl, name];
    });

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  async subscribeToEvent(filter: unknown, onChange: (params?: any) => void) {
    const subscription = this.relay.subscribe([filter], {
      onevent: async (event) => {
        console.log('receiving event:', event);
        onChange(event);
        const { kind, content: encryptedContent, id, tags } = event || {};

        const conversationKey = await this.getConversationKey();
        const content = v2.decrypt(encryptedContent, conversationKey);
        console.log('content: ', content);
        // if (kind === 4) {
        //   content = await decrypt(privKey, event.pubkey, content);
        // }

        //   setMessages([...messages, { id, text: content }]);
        // window.scrollTo(0, document.body.scrollHeight);
      },
      onclose: () => {
        subscription.close();
      },
    });

    return subscription;
  }

  async publishEvent(text: string, kind = 1, tags: string[][] = []) {
    const conversationKey = await this.getConversationKey();
    const content = v2.encrypt(text, conversationKey);

    const event = {
      content,
      created_at: Math.floor(Date.now() / 1000),
      kind,
      tags,
      pubkey: this.publicKey,
    };

    const signedEvent = await getSignedEvent(event, this.privateKey);
    console.log('signedEvent:', signedEvent);

    try {
      await this.relay.publish(signedEvent);
    } catch (e) {
      console.error(e);
    }
  }

  unsubscribe() {
    if (this.relay) {
      this.relay.close();
      console.log('Disconnected from relay.');
    }
  }
}
