import { Event, Filter, Relay, Subscription } from 'nostr-tools';
import { v2 } from '../utils/encryption';
import { getSignedEvent } from '../utils/getSignedEvent';
import { FriendOrFollowList, Contact } from '../types';
import { useQuery } from '@realm/react';
import { User } from './User';
import { useEffect, useState } from 'react';
import { Results } from 'realm';

const relayUrl = 'wss://relay.damus.io';
// const relayUrl = 'wss://relay.nostrassets.com';

export const KINDS = {
  PROFILE: 2,
  FOLLOW_LIST: 3,
  DIRECT_MESSAGE: 4,
};

export const useRelayService = () => {
  const users = useQuery(User);
  const initializeRelayService = (users: Results<User>) => {
    const user = users[0];

    const privateKey = user.privateKey;
    const publicKey = user.publicKey;

    return new RelayService(privateKey, publicKey);
  };
  const [relayService, setRelayService] = useState<RelayService>(initializeRelayService(users));

  useEffect(() => {
    const newRS = initializeRelayService(users);
    setRelayService(newRS);
  }, [users]);

  return relayService;
};

export class RelayService {
  private relay: Relay | null = null;
  private privateKey: string;
  private publicKey: string;
  private subNum: number;
  // private cachedEvents: Record<string, Event>;

  constructor(privateKey: string, publicKey: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.subNum = 0;
  }

  private getRelay = async () => {
    if (this.relay && this.relay.connected) {
      return this.relay;
    }

    console.log('connecting');
    try {
      this.relay = await Relay.connect(relayUrl);
    } catch (e) {
      throw new Error('Error on connecting to relay');
    }

    console.log('connected');

    return this.relay;
  };

  public getPublicKey() {
    return this.publicKey;
  }

  public async updateProfile(newName: string) {
    console.log('update profile');
    await this.publishEvent('profile', KINDS.PROFILE, [['name', newName]]);
  }

  public async fetchContacts() {
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

    const contacts: Record<string, { name: string }> = {};

    for (const e of events) {
      const { pubkey: friendPubkey, tags } = e || {};
      const trimmedTags = tags.filter((tag) => {
        return tag[0] === 'p';
      });

      for (const tag of trimmedTags) {
        const [, pubKey, , name] = tag;
        if (pubKey === this.publicKey) {
          const profile = await this.getUserProfile(friendPubkey);
          contacts[friendPubkey] = profile;
          break;
        }
      }
    }

    console.log('contacts: ', contacts);
    return contacts;
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
  public async getUserFollowList(publicKey: string) {
    const filter = { authors: [publicKey], kinds: [KINDS.FOLLOW_LIST], limit: 1 };
    console.log('getUserFollowList() with filter: ', filter);
    const events = await this.fetch([filter]);
    const { tags } = events[0];
    return tags.map((tag) => ({ publicKey: tag[1], name: tag[3] }));
  }

  private getFollowListAsTags(followList: Contact[]) {
    return Object.entries(followList).map(([publicKey, { name }]) => {
      return ['p', publicKey, relayUrl, name];
    });
  }

  public async addUserToFollowList(newContact: Contact) {
    const myFollowList = await this.getUserFollowList(this.publicKey);
    myFollowList.push({ name: newContact.name, publicKey: newContact.publicKey });
    const tags = this.getFollowListAsTags(myFollowList);

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  public async removeUserFromFollowList(newContact: Contact) {
    const myFollowList = await this.getUserFollowList(newContact.publicKey);
    myFollowList.filter((contact) => contact.publicKey !== newContact.publicKey);
    const tags = this.getFollowListAsTags(myFollowList);

    await this.publishEvent('follow list', KINDS.FOLLOW_LIST, tags);
  }

  private async fetch(filters: Filter[]): Promise<Event[]> {
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

  public async subscribeToEvent(filters: Filter[], onChange: (params?: any) => void = () => ({})) {
    this.subNum++;
    // console.log('subNum: ', this.subNum);
    const relay = await this.getRelay();

    const subscription = relay.subscribe(filters, {
      onevent: async (event: Event) => {
        const { kind, content: encryptedContent, id, tags, pubkey } = event || {};

        if (kind === KINDS.DIRECT_MESSAGE) {
          // console.log('receiving event:', {
          //   pubkey: `${event.pubkey.substring(0, 5)}#####`,
          //   tags: event.tags,
          // });

          const conversationKey =
            pubkey === this.publicKey
              ? await v2.utils.getConversationKey(this.privateKey, tags[0][1]) // sent message
              : await v2.utils.getConversationKey(this.privateKey, pubkey); // received message
          const content = v2.decrypt(encryptedContent, conversationKey);

          onChange({ ...event, content });
        } else {
          onChange(event);
        }
        //   setMessages([...messages, { id, text: content }]);
        // window.scrollTo(0, document.body.scrollHeight);
      },
      onclose: () => {
        this.subNum--;
        // console.log('subNum--: ', this.subNum);
        return;
      },
      eoseTimeout: 9999999,
    });

    return subscription;
  }

  // working on
  public async sendMessageTo(receiverPubKey: string, text: string) {
    const tags = [['p', receiverPubKey]];
    await this.publishEvent(text, KINDS.DIRECT_MESSAGE, tags);
  }

  private async publishEvent(text: string, kind: number, tags: string[][] = []) {
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
      const relay = await this.getRelay();
      relay.publish(signedEvent);
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
