import { Relay } from 'nostr-tools';
import { v2 } from './utils/encryption';
import { getSignedEvent } from './utils/getSignedEvent';
import { getLocalPrivKey, getPubKey } from './constants';

const relayUrl = 'wss://relay.damus.io';

export const initializeRelay = async () => {
  console.log(`connecting to ${relayUrl}`);
  let relay: Relay;
  try {
    relay = await Relay.connect(relayUrl);
  } catch (e) {
    throw new Error('Error on connecting to relay');
  }
  console.log(`connected to ${relayUrl}`);
  const privateKey = await getLocalPrivKey();
  const publicKey = getPubKey(privateKey);
  const relayService = new RelayService(privateKey, publicKey, relay);
  console.log('got relay service');
  return relayService;
};

export class RelayService {
  private relay: Relay;
  private privateKey: string;
  private publicKey: string;

  constructor(privateKey: string, publicKey: string, relay: Relay) {
    this.relay = relay;
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  private async getConversationKey() {
    return v2.utils.getConversationKey(this.privateKey, this.publicKey);
  }

  async subscribeToEvent() {
    const filter = { authors: [this.publicKey] };
    const subscription = this.relay.subscribe([filter], {
      onevent: async (event) => {
        console.log('receiving event:', event);

        const { kind, content: encryptedContent, id } = event || {};
        console.log('encryptedContent on receive:', encryptedContent);
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

  async publishEvent(text: string) {
    const conversationKey = await this.getConversationKey();
    const content = v2.encrypt(text, conversationKey);

    const event = {
      content,
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      pubkey: this.publicKey,
    };

    const signedEvent = await getSignedEvent(event, this.privateKey);
    console.log('signedEvent:', signedEvent);

    await this.relay.publish(signedEvent);
  }

  unsubscribe() {
    if (this.relay) {
      this.relay.close();
      console.log('Disconnected from relay.');
    }
  }
}
