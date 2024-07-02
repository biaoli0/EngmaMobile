import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRelayService } from '../models/RelayService';
import { Contact } from '../types';

const ConnectButton = ({ newContact }: { newContact: Contact }) => {
  const [status, setStatus] = useState('connect'); //pending, connected, connect
  const [myInvitationStatus, setMyInvitationStatus] = useState(false);
  const [theirInvitationStatus, setTheirInvitationStatus] = useState(false);
  const RS = useRelayService();

  useEffect(() => {
    const loadInvitationStatuses = async () => {
      console.log('calling loadInvitationStatuses()');

      const myFollowList = (await RS.getUserFollowList(RS.getPublicKey())).map(
        (contact) => contact.publicKey,
      );
      const newMyInvitationStatus = myFollowList.includes(newContact.publicKey);

      const theirFollowList = (await RS.getUserFollowList(newContact.publicKey)).map(
        (contact) => contact.publicKey,
      );
      const newTheirInvitationStatus = theirFollowList.includes(RS.getPublicKey());

      setMyInvitationStatus(newMyInvitationStatus);
      setTheirInvitationStatus(newTheirInvitationStatus);
    };

    loadInvitationStatuses();
  }, [newContact.publicKey, RS]);

  useEffect(() => {
    console.log('myInvitationStatus', myInvitationStatus);
    console.log('theirInvitationStatus', theirInvitationStatus);
    if (myInvitationStatus && theirInvitationStatus) {
      setStatus('connected');
    }
    if (!myInvitationStatus && theirInvitationStatus) {
      setStatus('connect');
    }
    if (myInvitationStatus && !theirInvitationStatus) {
      setStatus('pending');
    }
    if (!myInvitationStatus && !theirInvitationStatus) {
      setStatus('connect');
    }
  }, [myInvitationStatus, theirInvitationStatus]);

  const handlePress = async () => {
    if (status === 'connect') {
      await RS.addUserToFollowList(newContact);
      setMyInvitationStatus(true);
    }
    if (status === 'pending') {
      await RS.removeUserFromFollowList(newContact);
      setMyInvitationStatus(false);
    }
  };

  return (
    <TouchableOpacity
      style={status === 'pending' ? styles.pendingButton : styles.connectButton}
      onPress={handlePress}
    >
      <Text style={styles.text}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pendingButton: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 5,
  },
  connectButton: {
    borderColor: 'blue',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: 'black',
  },
});

export default ConnectButton;
