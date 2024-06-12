import { Event, Filter, Relay } from 'nostr-tools';
import { v2 } from './utils/encryption';
import { getSignedEvent } from './utils/getSignedEvent';
import { getLocalPrivKey, getPubKey } from './constants';
import { FriendOrFollowList, Contact } from './types';

// const relayUrl = 'wss://relay.damus.io';
const relayUrl = 'wss://relay.nostrassets.com';

export const KINDS = {
  PROFILE: 2,
  FOLLOW_LIST: 3,
  DIRECT_MESSAGE: 4,
};

let relayService: RelayService | null;

const relayConnect = async (): Promise<Relay> => {
  if (!RelayService.relay || !RelayService.relay?.connected) {
    console.log('connecting relay');
    try {
      return Relay.connect(relayUrl);
    } catch (e) {
      throw new Error('Error on connecting to relay');
    }
  }

  return RelayService.relay;
};

export const resetRelayService = async () => {
  console.log('resetting relay service');
  const relay = await relayConnect();
  const privateKey = await getLocalPrivKey();
  const publicKey = getPubKey(privateKey);

  relayService = new RelayService(privateKey, publicKey, relay);
  // await relayService.getUserProfile(publicKey);

  return relayService;
};

export const getRelayService = async (): Promise<RelayService> => {
  console.log('initializing relay service');

  if (!relayService) {
    console.log('reset relay service');
    return resetRelayService();
  }

  return relayService;
};

export class RelayService {
  static relay: Relay;
  private privateKey: string;
  private publicKey: string;
  private followList: FriendOrFollowList = {};
  private friendList: FriendOrFollowList = {};
  // private cachedEvents: Record<string, Event>;

  constructor(privateKey: string, publicKey: string, relay: Relay) {
    RelayService.relay = relay;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  private async getConversationKey() {
    return v2.utils.getConversationKey(this.privateKey, this.publicKey);
  }

  public getPublicKey() {
    return this.publicKey;
  }

  public getFriendList() {
    return this.friendList;
  }

  public async updateProfile(newName: string) {
    console.log('update profile');
    await this.publishEvent('profile', KINDS.PROFILE, [['name', newName]]);
  }

  async fetchFriendList(publicKey: string) {
    const filterForFollowList = {
      authors: [publicKey],
      kinds: [KINDS.FOLLOW_LIST],
      limit: 1,
    };

    const [event] = await this.fetch([filterForFollowList]);
    const { tags } = event || {};

    const trimmedTags = tags.filter((tag) => {
      return tag[0] === 'p';
    });

    const filters = trimmedTags.map((tag) => {
      const [, publicKey] = tag;
      const filter = { authors: [publicKey], kinds: [KINDS.FOLLOW_LIST], limit: 1 };
      return filter;
    });

    const events = await this.fetch(filters);

    const friendList: Record<string, { name: string }> = {};
    events.forEach((e) => {
      const { tags } = e || {};
      const trimmedTags = tags.filter((tag) => {
        return tag[0] === 'p';
      });
      trimmedTags.forEach((tag) => {
        const [, publicKey, , name] = tag;
        if (publicKey === this.publicKey) {
          friendList[publicKey] = { name };
          return;
        }
      });
    });

    console.log('friendList', friendList);
    return friendList;
  }

  // subscribe to the real time profile
  async getUserProfile(publicKey: string) {
    const filter = { authors: [publicKey], kinds: [KINDS.PROFILE], limit: 1 };
    console.log('getUserProfile() with filter: ', filter);
    const events = await this.fetch([filter]);
    const { tags } = events[0] || {};
    const [, name] = tags[0];
    return { name };
  }

  // subscribe to the real time follow list
  async getUserFollowList(publicKey: string) {
    const filter = { authors: [publicKey], kinds: [KINDS.FOLLOW_LIST], limit: 1 };
    console.log('getUserFollowList() with filter: ', filter);
    const events = await this.fetch([filter]);
    const { tags } = events[0];
    return tags.map((tag) => tag[1]);
  }

  async addUserToFollowList(newContact: Contact) {
    this.followList[newContact.publicKey] = { name: newContact.name };
    const tags = this.getFollowListAsTags(this.followList);

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  getFollowListAsTags(followList: FriendOrFollowList) {
    return Object.entries(followList).map(([publicKey, { name }]) => {
      return ['p', publicKey, relayUrl, name];
    });
  }

  async removeUserFromFollowList(newContact: Contact) {
    delete this.followList[newContact.publicKey];
    const tags = Object.entries(this.followList).map(([publicKey, { name }]) => {
      return ['p', publicKey, relayUrl, name];
    });

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  async fetch(filters: Filter[]): Promise<Event[]> {
    const events: Event[] = [];
    const promises: Promise<void>[] = [];

    filters.forEach((filter) => {
      if (filter.limit !== 1) {
        throw new Error('fetch filter should have limit = 1');
      }
      promises.push(
        new Promise<void>((resolve) => {
          this.subscribeToEvent([filter], (event: Event) => {
            events.push(event);
            resolve();
          });
        }),
      );
    });

    await Promise.all(promises);

    return events;
  }

  async subscribeToEvent(filters: Filter[], onChange: (params?: any) => void = () => ({})) {
    try {
      if (!RelayService.relay || !RelayService.relay.connected) {
        RelayService.relay = await relayConnect();
      }
    } catch (e) {
      console.error(e);
    }

    const subscription = RelayService.relay.subscribe(filters, {
      onevent: async (event: Event) => {
        console.log('receiving event:', {
          pubkey: `${event.pubkey.substring(0, 5)}#####`,
          kind: event.kind,
          tags: event.tags,
        });
        onChange(event);
        const { kind, content: encryptedContent, id, tags } = event || {};

        const conversationKey = await this.getConversationKey();
        const content = v2.decrypt(encryptedContent, conversationKey);
        console.log('content: ', content);
        onChange({ ...event, content });
        //   setMessages([...messages, { id, text: content }]);
        // window.scrollTo(0, document.body.scrollHeight);
      },
      onclose: () => {},
    });

    return subscription;
  }

  async sendMessageTo(receiverPubKey: string, text: string) {
    const tags = [['p', receiverPubKey]];
    await this.publishEvent(text, KINDS.DIRECT_MESSAGE, tags);
  }

  async publishEvent(text: string, kind: number, tags: string[][] = []) {
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
      if (!RelayService.relay || !RelayService.relay.connected) {
        await relayConnect();
      }
      await RelayService.relay.publish(signedEvent);
    } catch (e) {
      console.error(e);
    }
  }

  unsubscribe() {
    if (RelayService.relay) {
      RelayService.relay.close();
      console.log('Disconnected from relay.');
    }
  }
}
