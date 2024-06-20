import { Event, Filter, Relay, Subscription } from 'nostr-tools';
import { v2 } from '../utils/encryption';
import { getSignedEvent } from '../utils/getSignedEvent';
import { getLocalPrivKey, getPubKey } from '../constants';
import { FriendOrFollowList, Contact } from '../types';

const relayUrl = 'wss://relay.damus.io';
// const relayUrl = 'wss://relay.nostrassets.com';

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
  private subNum: number;
  private followList: FriendOrFollowList = {};
  // private cachedEvents: Record<string, Event>;

  constructor(privateKey: string, publicKey: string, relay: Relay) {
    RelayService.relay = relay;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.subNum = 0;
  }

  public getPublicKey() {
    return this.publicKey;
  }

  public async updateProfile(newName: string) {
    console.log('update profile');
    await this.publishEvent('profile', KINDS.PROFILE, [['name', newName]]);
  }

  async fetchFriendList() {
    const filterForFollowList = {
      authors: [this.publicKey],
      kinds: [KINDS.FOLLOW_LIST],
      limit: 1,
    };

    const [event] = await this.fetch([filterForFollowList]);
    const { tags } = event || {};

    const trimmedTags = tags.filter((tag) => {
      return tag[0] === 'p';
    });

    const filters = trimmedTags.map((tag) => {
      const [, pubKey] = tag;
      const filter = { authors: [pubKey], kinds: [KINDS.FOLLOW_LIST], limit: 1 };
      return filter;
    });

    const events = await this.fetch(filters);

    const friendList: Record<string, { name: string }> = {};

    for (const e of events) {
      const { pubkey: friendPubkey, tags } = e || {};
      const trimmedTags = tags.filter((tag) => {
        return tag[0] === 'p';
      });

      for (const tag of trimmedTags) {
        const [, pubKey, , name] = tag;
        if (pubKey === this.publicKey) {
          const profile = await this.getUserProfile(friendPubkey);
          friendList[friendPubkey] = profile;
          break;
        }
      }
    }

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
    const subs: Promise<Subscription>[] = [];

    filters.forEach((filter) => {
      if (filter.limit !== 1) {
        throw new Error('fetch filter should have limit = 1');
      }
      promises.push(
        new Promise<void>((resolve) => {
          const sub = this.subscribeToEvent([filter], (event: Event) => {
            events.push(event);
            resolve();
          });

          subs.push(sub);
        }),
      );
    });

    await Promise.all(promises);
    for (const sub of subs) {
      const s = await sub;
      s.close();
    }

    return events;
  }

  async subscribeToEvent(filters: Filter[], onChange: (params?: any) => void = () => ({})) {
    this.subNum++;
    console.log('subNum: ', this.subNum);
    try {
      if (!RelayService.relay || !RelayService.relay.connected) {
        RelayService.relay = await relayConnect();
      }
    } catch (e) {
      console.error(e);
    }

    const subscription = RelayService.relay.subscribe(filters, {
      onevent: async (event: Event) => {
        const { kind, content: encryptedContent, id, tags, pubkey } = event || {};

        if (kind === KINDS.DIRECT_MESSAGE) {
          console.log('receiving event:', {
            pubkey: `${event.pubkey.substring(0, 5)}#####`,
            tags: event.tags,
          });

          const conversationKey =
            pubkey === this.publicKey
              ? await v2.utils.getConversationKey(this.privateKey, tags[0][1]) // sent message
              : await v2.utils.getConversationKey(this.privateKey, pubkey); // received message
          const content = v2.decrypt(encryptedContent, conversationKey);
          console.log('content: ', content);
          onChange({ ...event, content });
        } else {
          onChange(event);
        }
        //   setMessages([...messages, { id, text: content }]);
        // window.scrollTo(0, document.body.scrollHeight);
      },
      onclose: () => {
        this.subNum--;
        console.log('subNum--: ', this.subNum);
        return;
      },
      eoseTimeout: 9999999,
    });

    return subscription;
  }

  async sendMessageTo(receiverPubKey: string, text: string) {
    const tags = [['p', receiverPubKey]];
    await this.publishEvent(text, KINDS.DIRECT_MESSAGE, tags);
  }

  async publishEvent(text: string, kind: number, tags: string[][] = []) {
    const conversationKey = await v2.utils.getConversationKey(this.privateKey, tags[0][1]);
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
