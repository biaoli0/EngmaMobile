import 'text-encoding-polyfill';
import * as secp from '@noble/secp256k1';
import { bytesToHex } from '@noble/hashes/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// export const privKey = bytesToHex(secp.utils.randomPrivateKey());
// export const privKey = 'd90ad8a8df94ce08ff585d54bf74d5cab44924bfb945593f261b561558410c06';

export const getLocalPrivKey = async () => {
  return AsyncStorage.getItem('privKey');
};

export const generatePrivKey = () => {
  return bytesToHex(secp.utils.randomPrivateKey());
};

export const getPubKey = (privKey: string) => {
  const pubKey = secp.getPublicKey(privKey, true);
  const pubKeyString = bytesToHex(pubKey);
  console.log('pubKey:', pubKeyString);
  console.log('privKey:', privKey);
  return pubKeyString.substring(2);
};
