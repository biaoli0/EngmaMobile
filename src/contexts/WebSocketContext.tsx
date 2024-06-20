import { createContext } from 'react';
import { RelayService } from '../models/RelayService';

interface RelayWebSocket {
  relay: RelayService;
  hasPrivateKey: boolean;
}

const WebSocketContext = createContext<RelayWebSocket | undefined>(undefined);

export default WebSocketContext;
