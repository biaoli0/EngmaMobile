import Realm, { BSON, ObjectSchema } from 'realm';
import { Contact } from './Contact';

export class Message extends Realm.Object<Message> {
  id!: BSON.ObjectId;
  text!: string;
  createdAt!: number;
  sender!: Contact;
  convoWith!: Contact;

  static schema: ObjectSchema = {
    name: 'Message',
    properties: {
      id: 'objectId',
      text: { type: 'string' },
      sender: 'Contact',
      createdAt: { type: 'int' },
      convoWith: 'Contact',
    },
    primaryKey: 'id',
  };
}
