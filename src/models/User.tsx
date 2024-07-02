import Realm, { BSON, ObjectSchema } from 'realm';

export class User extends Realm.Object<User> {
  _id!: BSON.ObjectId;
  publicKey!: string;
  privateKey!: string;
  name?: string;

  static schema: ObjectSchema = {
    name: 'User',
    properties: {
      _id: 'objectId',
      name: { type: 'string' },
      publicKey: { type: 'string' },
      privateKey: { type: 'string' },
    },
    primaryKey: '_id',
  };
}
