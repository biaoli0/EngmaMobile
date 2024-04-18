import React, { useEffect, useState } from 'react';
import * as secp from '@noble/secp256k1';
import { Input, bytesToHex } from '@noble/hashes/utils';

import WebSocketContext from './WebSocketContext';
import { v2 } from '../utils/encryption';
import { getLocalPrivKey, getPubKey } from '../constants';

const relay = 'wss://relay.damus.io';

const getConversationKey = async () => {
  const privKey = await getLocalPrivKey();
  const pubKey = getPubKey(privKey);
  return v2.utils.getConversationKey(privKey, pubKey);
};

const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket>(null);

  useEffect(() => {
    const ws = new WebSocket(relay);

    // Subscribe to the relay
    ws.onopen = async () => {
      console.log('connected to ' + relay);
      // setMessages([]);
      const subId = bytesToHex(secp.utils.randomPrivateKey()).substring(0, 16);
      const privKey = await getLocalPrivKey();
      const pubKey = getPubKey(privKey);
      const filter = { authors: [pubKey] };

      const subscription = ['REQ', subId, filter];
      console.log('Subscription:', subscription);

      ws.send(JSON.stringify(subscription));
    };

    // Log any messages the relay sends you
    ws.onmessage = async (message) => {
      console.log('receiving message:', message);
      const [type, subId, event] = JSON.parse(message.data);
      if (type === 'EVENT') {
        const { kind, content: encryptedContent, id } = event || {};
        console.log('encryptedContent on receive:', encryptedContent);
        const conversationKey = await getConversationKey();
        const content = v2.decrypt(encryptedContent, conversationKey);
        console.log('content: ', content);

        if (!event || event === true) return;

        // if (kind === 4) {
        //   content = await decrypt(privKey, event.pubkey, content);
        // }

        //   setMessages([...messages, { id, text: content }]);
        // window.scrollTo(0, document.body.scrollHeight);
      }
    };

    ws.onclose = () => {
      console.log('disconnected from ' + relay);
      // Cleanup socket on close
      setSocket(null);
    };

    setSocket(ws);

    // Clean up the socket when the component unmounts
    return () => ws.close();
  }, []);

  return <WebSocketContext.Provider value={socket}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
