import Realm, { BSON, ObjectSchema } from 'realm';

export class Contact extends Realm.Object<Contact> {
  publicKey!: string;
  name!: string;

  static schema: ObjectSchema = {
    name: 'Contact',
    properties: {
      publicKey: { type: 'string' },
      name: { type: 'string' },
    },
    primaryKey: 'publicKey',
  };
}
