import React, { useEffect, useState } from 'react';
import { Event } from 'nostr-tools';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getRelayService } from '../RelayService';
import { NewContact } from '../types';

const checkIfTagsContainPubKey = (tags: string[][], publicKey: string) => {
  tags.forEach((tag) => {
    const tagStr = tag.toString();
    if (tagStr.includes(publicKey)) {
      return true;
    }
  });

  return false;
};

const ConnectButton = ({ newContact }: { newContact: NewContact }) => {
  const [status, setStatus] = useState('connect'); //pending, connected, connect
  const [myInvitationStatus, setMyInvitationStatus] = useState(false);
  const [theirInvitationStatus, setTheirInvitationStatus] = useState(false);

  useEffect(() => {
    const loadInvitationStatuses = async () => {
      const relay = await getRelayService();
      const followList = relay.getFollowList();
      const newMyInvitationStatus = Object.keys(followList).includes(newContact.publicKey);
      setMyInvitationStatus(newMyInvitationStatus);

      const getTheirFollowList = (event: Event) => {
        const { tags } = event || {};
        console.log('their tags', tags);
        const newTheirInvitationStatus = checkIfTagsContainPubKey(tags, newContact.publicKey);
        setTheirInvitationStatus(newTheirInvitationStatus);
      };

      await relay.getUserFollowList(newContact.publicKey, getTheirFollowList);
    };

    loadInvitationStatuses();
  }, [newContact.publicKey]);

  useEffect(() => {
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
