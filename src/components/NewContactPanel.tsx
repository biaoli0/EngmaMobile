import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ConnectButton from './ConnectButton';
import { NewContact } from '../types';

const NewContactPanel = ({ newContact }: { newContact: NewContact }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.newContact}>{newContact.name}</Text>
      <ConnectButton newContact={newContact} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 0.5,
    paddingLeft: 10,
  },
  newContact: {
    color: 'black',
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default NewContactPanel;
