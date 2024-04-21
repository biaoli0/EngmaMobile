export class NoPrivateKeyError extends Error {
  constructor(message: string) {
    super(message); // Pass the message to the base Error class
  }
}
