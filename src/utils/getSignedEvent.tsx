import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';
import { schnorr } from '@noble/curves/secp256k1';
secp.etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, secp.etc.concatBytes(...m));
import { bytesToHex } from './hex';
import { Event, SignedEvent } from '../types';

export async function getSignedEvent(event: Event, privateKey: string): Promise<SignedEvent> {
  const eventData = JSON.stringify([
    0, // Reserved for future use
    event['pubkey'], // The sender's public key
    event['created_at'], // Unix timestamp
    event['kind'], // Message “kind” or type
    event['tags'], // Tags identify replies/recipients
    event['content'], // Your note contents
  ]);
  const id = bytesToHex(await sha256(new TextEncoder().encode(eventData)));
  const sig = bytesToHex(await schnorr.sign(id, privateKey));
  return { ...event, id, sig };
}
