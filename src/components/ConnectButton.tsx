import React, { useEffect, useState } from 'react';

import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getRelayService } from '../models/RelayService';
import { Contact } from '../types';

const ConnectButton = ({ newContact }: { newContact: Contact }) => {
  const [status, setStatus] = useState('connect'); //pending, connected, connect
  const [myInvitationStatus, setMyInvitationStatus] = useState(false);
  const [theirInvitationStatus, setTheirInvitationStatus] = useState(false);

  useEffect(() => {
    const loadInvitationStatuses = async () => {
      console.log('calling loadInvitationStatuses()');
      const relay = await getRelayService();

      const myFollowList = await relay.getUserFollowList(relay.getPublicKey());
      const newMyInvitationStatus = myFollowList.includes(newContact.publicKey);

      const theirFollowList = await relay.getUserFollowList(newContact.publicKey);
      const newTheirInvitationStatus = theirFollowList.includes(relay.getPublicKey());

      setMyInvitationStatus(newMyInvitationStatus);
      setTheirInvitationStatus(newTheirInvitationStatus);
    };

    loadInvitationStatuses();
  }, [newContact.publicKey]);

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
      const relay = await getRelayService();
      await relay.addUserToFollowList(newContact);
      setMyInvitationStatus(true);
    }
    if (status === 'pending') {
      const relay = await getRelayService();
      await relay.removeUserFromFollowList(newContact);
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
