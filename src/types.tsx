export type Message = {
  id: string;
  text: string;
  createdAt: number;
  publicKey: string;
};

export type Event = {
  content: string;
  created_at: number;
  kind: number;
  tags: string[][];
  pubkey: string;
};

export type SignedEvent = Event & {
  id: string;
  sig: string;
};

export type Contact = {
  name: string;
  publicKey: string;
};

export type FriendOrFollowList = Record<string, { name: string }>;
