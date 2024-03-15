import * as secp from '@noble/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { hmac } from '@noble/hashes/hmac';
import { schnorr } from '@noble/curves/secp256k1';
secp.etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, secp.etc.concatBytes(...m));
import { bytesToHex } from './hex';

export async function getSignedEvent(event, privateKey) {
  const eventData = JSON.stringify([
    0, // Reserved for future use
    event['pubkey'], // The sender's public key
    event['created_at'], // Unix timestamp
    event['kind'], // Message “kind” or type
    event['tags'], // Tags identify replies/recipients
    event['content'], // Your note contents
  ]);
  event.id = bytesToHex(await sha256(new TextEncoder().encode(eventData)));
  event.sig = bytesToHex(await schnorr.sign(event.id, privateKey));
  return event;
}
