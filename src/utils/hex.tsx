export const hexToBytes = (hex: string): Uint8Array => {
  const matches = hex.match(/.{1,2}/g);
  if (!matches) {
    throw new Error('Invalid hex string');
  }
  return new Uint8Array(matches.map((byte) => parseInt(byte, 16)));
};

export const bytesToHex = (bytes: Uint8Array): string => {
  return bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};
