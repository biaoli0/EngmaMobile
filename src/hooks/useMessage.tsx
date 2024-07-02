import { useObject, useQuery, useRealm } from '@realm/react';
import { KINDS, useRelayService } from '../models/RelayService';
import { User } from '../models/User';
import { BSON } from 'realm';
import { Contact } from '../models/Contact';
import { Message as MessageType } from '../types';
import { useEffect, useState } from 'react';
import { emptyMessage } from '../constants';
import { useUser } from './useUser';
import { useContact } from './useContact';
import { Event, Subscription } from 'nostr-tools';
import { Message } from '../models/Message';

const transformMessageFromDB = (message: Message): MessageType => {
  const { id, text, createdAt, sender, convoWith } = message;
  const date = new Date(createdAt);
  const formattedDate = date.toLocaleTimeString();

  return {
    id: id.toString(),
    text,
    user: sender.name,
    publicKey: sender.publicKey,
    createdAt,
    avatar: 'https://via.placeholder.com/40',
    isCurrentUser: convoWith.publicKey !== sender.publicKey,
    convoWith,
    time: formattedDate,
  };
};

export const useMessage = () => {
  const messages = useQuery(Message);
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [newMessage, setNewMessage] = useState<MessageType>(emptyMessage);
  const RS = useRelayService();
  const { getProfile } = useUser();
  const { contacts } = useContact();

  const transformMessageToDB = (message: MessageType): Message => {
    const { id, text, user, publicKey, createdAt, convoWith } = message;

    const sender = useObject(Contact, publicKey);
    const convoWithContact = useObject(Contact, convoWith.publicKey);

    return {
      id: id ? new BSON.ObjectId(id) : new BSON.ObjectId(),
      text,
      createdAt,
      sender,
      convoWith: convoWithContact,
    };
  };

  useEffect(() => {
    let sub: Subscription;

    const getMessages = async () => {
      console.log('calling getMessages()');

      const myPubkey = RS.getPublicKey();
      const { name: myName } = await getProfile(myPubkey);

      const filters = Object.keys(contacts)
        .map((friendPubKey) => {
          const filter1 = {
            authors: [myPubkey],
            kinds: [KINDS.DIRECT_MESSAGE],
            '#p': [friendPubKey],
          };
          const filter2 = {
            authors: [friendPubKey],
            kinds: [KINDS.DIRECT_MESSAGE],
            '#p': [myPubkey],
          };
          return [filter1, filter2];
        })
        .flat();

      sub = await RS.subscribeToEvent(filters, (event: Event) => {
        const { content, id, created_at: createdAt, pubkey } = event;
        const date = new Date(createdAt);
        const formattedDate = date.toLocaleTimeString();

        const newMessage: Message = {
          id,
          avatar: 'https://via.placeholder.com/40',
          user: pubkey === myPubkey ? myName : contacts[pubkey].name,
          publickey: pubkey,
          text: content,
          createdAt,
          isCurrentUser: pubkey === myPubkey,
          time: formattedDate,
          convoWith: { publicKey: pubkey, name: contacts[pubkey].name },
        };
        setNewMessage(newMessage);
      });
    };

    getMessages();

    return () => {
      sub.close();
    };
  }, []);

  return { getProfile, newMessage, messages };
};
