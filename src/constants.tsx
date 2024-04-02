import 'text-encoding-polyfill';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// export const privKey = bytesToHex(secp.utils.randomPrivateKey());
// export const privKey = 'd90ad8a8df94ce08ff585d54bf74d5cab44924bfb945593f261b561558410c06';

export const getLocalPrivKey = async () => {
  return AsyncStorage.getItem('privKey');
};

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
