import { useQuery, useRealm } from '@realm/react';
import { useRelayService } from '../models/RelayService';
import { User } from '../models/User';
import { BSON } from 'realm';
import { Contact } from '../models/Contact';

export const useUser = () => {
  const realm = useRealm();
  const RS = useRelayService();
  const users = useQuery(User);
  const contacts = useQuery(Contact);

  console.log('realm db file path:', realm.path);

  const getProfile = async (publicKey: string) => {
    const myPubkey = RS.getPublicKey();
    if (myPubkey === publicKey) {
      return { name: users[0].name };
    }

    const contact = contacts.find((contact) => contact._id === publicKey);
    if (contact) {
      return { name: contact.name };
    }

    const contactFromRelay = await RS.getUserProfile(publicKey);
    if (contact) {
      return { name: contactFromRelay.name };
    }

    throw new Error('Contact not found');
  };

  const updateProfile = async (name: string) => {
    await RS.updateProfile(name);
    realm.write(() => {
      users[0].name = name;
    });
  };

  const saveNewUser = (privateKey: string, publicKey: string) => {
    realm.write(() => {
      realm.create(User, {
        _id: new BSON.ObjectId(),
        privateKey,
        publicKey,
        name: 'name',
      });
    });
  };

  return { updateProfile, getProfile, saveNewUser, users };
};
