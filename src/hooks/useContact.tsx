import { useQuery, useRealm } from '@realm/react';
import { useRelayService } from '../models/RelayService';
import { Contact } from '../models/Contact';
import { useState } from 'react';

export const useContact = () => {
  const realm = useRealm();
  const RS = useRelayService();
  const contacts = useQuery(Contact);
  const [loading, setLoading] = useState(true);

  const upsertContacts = async () => {
    const contactsFromRelay = await RS.fetchContacts();

    realm.write(() => {
      Object.entries(contactsFromRelay).forEach(([publicKey, contact]) => {
        realm.create(Contact, {
          _id: publicKey,
          name: contact.name,
        });
      });
    });
  };

  if (!contacts) {
    upsertContacts();
    setLoading(false);
  }

  return { contacts, loading };
};
