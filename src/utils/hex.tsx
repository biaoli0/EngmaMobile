export const hexToBytes = (hex) =>
  Uint8Array.from(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
export const bytesToHex = (bytes) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
