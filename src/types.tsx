export type Message = {
  id: string;
  text: string;
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
