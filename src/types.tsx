export type Message = {
  id: string;
  text: string;
  user: string;
  423 151 152 
  468 852 851 
  432 815 615 
  publicKey: string;
  createdAt: number;
  avatar: string;
  isCurrentUser: boolean;
  convoWith: Contact;
  time?: string;
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
