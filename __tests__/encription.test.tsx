import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';
import { default as vec } from './nip44.vectors.json';
import { schnorr } from '@noble/curves/secp256k1';
import { throws } from 'node:assert';
import { v2 } from '../src/utils/encryption';
const v2vec = vec.v2;

describe('NIP44', () => {
  describe('valid', () => {
    test('get_conversation_key', () => {
      for (const v of v2vec.valid.get_conversation_key) {
        const key = v2.utils.getConversationKey(v.sec1, v.pub2);
        expect(bytesToHex(key)).toBe(v.conversation_key);
      }
    });
    test('encrypt_decrypt', () => {
      for (const v of v2vec.valid.encrypt_decrypt) {
        const pub2 = bytesToHex(schnorr.getPublicKey(v.sec2));
        const key = v2.utils.getConversationKey(v.sec1, pub2);
        expect(bytesToHex(key)).toBe(v.conversation_key);

        const ciphertext = v2.encrypt(v.plaintext, key, hexToBytes(v.nonce));
        expect(ciphertext).toBe(v.payload);
        const decrypted = v2.decrypt(ciphertext, key);
        expect(decrypted).toBe(v.plaintext);
      }
    });
    test('encrypt_decrypt_long_msg', () => {
      for (const v of v2vec.valid.encrypt_decrypt_long_msg) {
        const key = hexToBytes(v.conversation_key);
        const plaintext = v.pattern.repeat(v.repeat);
        expect(bytesToHex(sha256(plaintext))).toBe(v.plaintext_sha256);
        const ciphertext = v2.encrypt(plaintext, key, hexToBytes(v.nonce));
        expect(bytesToHex(sha256(ciphertext))).toBe(v.payload_sha256);
        const decrypted = v2.decrypt(ciphertext, key);
        expect(decrypted).toBe(plaintext);
      }
    });
    test('calc_padded_len', () => {
      for (const [len, testBePaddedTo] of v2vec.valid.calc_padded_len) {
        const actual = v2.utils.calcPaddedLen(len);
        expect(actual).toBe(testBePaddedTo);
      }
    });
  });

  describe('invalid', () => {
    test('encrypt_msg_lengths', () => {
      for (const v of v2vec.invalid.encrypt_msg_lengths) {
        throws(() => v2.encrypt('a'.repeat(v), randomBytes(32)));
      }
    });
    test('decrypt', async () => {
      for (const v of v2vec.invalid.decrypt) {
        throws(
          () => {
            v2.decrypt(v.payload, hexToBytes(v.conversation_key));
          },
          { message: new RegExp(v.note) },
        );
      }
    });
    test('get_conversation_key', async () => {
      for (const v of v2vec.invalid.get_conversation_key) {
        throws(() => v2.utils.getConversationKey(v.sec1, v.pub2), {
          message: /(Point is not on curve|Cannot find square root)/,
        });
      }
    });
  });
});
