import 'text-encoding-polyfill';
import * as secp from '@noble/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
// https://github.com/paulmillr/noble-secp256k1
// React Native needs crypto.getRandomValues polyfill and sha512
import 'react-native-get-random-values';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';

const hmacSha256Sync = (k: Input, ...m: any[]) => hmac(sha256, k, secp.etc.concatBytes(...m));
secp.etc.hmacSha256Sync = hmacSha256Sync;
secp.etc.hmacSha256Async = (k, ...m) => Promise.resolve(hmacSha256Sync(k, ...m));

export const generatePrivKey = () => {
  const privKey = bytesToHex(secp.utils.randomPrivateKey());
  console.log('generated privKey:', privKey);
  return privKey;
};

export const getPubKey = (privKey: string) => {
  console.log('privKey:', privKey);
  const pubKey = secp.getPublicKey(privKey, true);
  const pubKeyString = bytesToHex(pubKey);
  console.log('pubKey:', pubKeyString);
  return pubKeyString.substring(2);
};

export const emptyMessage = {
  id: '',
  text: '',
  user: '',
  publickey: '',
  createdAt: 1,
  avatar: '',
  isCurrentUser: true,
  convoWith: { publicKey: '', name: '' },
};
