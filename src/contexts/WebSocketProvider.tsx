import React, { useEffect, useState } from 'react';
import * as secp from '@noble/secp256k1';
import { Input, bytesToHex } from '@noble/hashes/utils';

import WebSocketContext from './WebSocketContext';
import { RelayService } from '../models/RelayService';
import { NoPrivateKeyError } from '../errors';

const WebSocketProvider = ({ children }) => {
  const [relay, setRelay] = useState<RelayService>(null);

  // const initializeRelayService = async () => {
  //   try {
  //     console.log('initializing relay service');
  //     const relayService = await initializeRelay();
  //     console.log('got relay service');
  //     setRelay(relayService);
  //   } catch (e) {
  //     if (e instanceof NoPrivateKeyError) {
  //       console.log('has no private key');
  //       setHasPrivateKey(false);
  //     }
  //   }
  // };

  return <WebSocketContext.Provider value={{ relay }}>{children}</WebSocketContext.Provider>;
};

export default WebSocketProvider;
