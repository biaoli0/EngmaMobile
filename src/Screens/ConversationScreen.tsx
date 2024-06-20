import React, { useCallback, useEffect, useState } from 'react';

import { BackHandler, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Contact, Message } from '../types';
import Messages from '../Messages';
import { KINDS, getRelayService } from '../models/RelayService';
import { Event, Subscription } from 'nostr-tools';
import { emptyMessage } from '../constants';
import { useFocusEffect } from '@react-navigation/native';

type Route = {
  params: { contact: Contact };
};

// A screen to show the first message of all conversation
const ConversationScreen = ({ route, navigation }: { route: Route }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<Message>(emptyMessage);
  const [sub, setSub] = useState<Subscription>();
  const [text, setText] = React.useState('');
  const { contact } = route.params;

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (sub) {
          sub.close();
        }
        navigation.goBack();
        return true;
      };

      // Add the event listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Clean up the event listener
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation, sub]),
  );

  useEffect(() => {
    if (newMessage.id !== emptyMessage.id) {
      const newMessages = [...messages, newMessage].sort((a, b) => a.createdAt - b.createdAt);
      setMessages(newMessages);
    }
  }, [newMessage]);

  useEffect(() => {
    const getMessages = async () => {
      console.log('calling getMessages()');
      const relay = await getRelayService();
      const myPubkey = relay.getPublicKey();
      const { name: myName } = await relay.getUserProfile(myPubkey);

      if (myPubkey && contact && contact.publicKey) {
        console.log('contact: ', route.params.contact);

        const filter1 = {
          authors: [myPubkey],
          kinds: [KINDS.DIRECT_MESSAGE],
          '#p': [contact.publicKey],
        };
        const filter2 = {
          authors: [contact.publicKey],
          kinds: [KINDS.DIRECT_MESSAGE],
          '#p': [myPubkey],
        };

        const sub = await relay.subscribeToEvent([filter1, filter2], (event: Event) => {
          const { content, id, created_at: createdAt, pubkey } = event || {};
          const newMessage: Message = {
            id,
            text: content,
            createdAt,
            avatar: 'https://via.placeholder.com/40',
            isCurrentUser: pubkey === myPubkey,
            user: pubkey === myPubkey ? myName : contact.name,
            publickey: pubkey,
          };
          setNewMessage(newMessage);
        });

        setSub(sub);
      }
    };

    getMessages();
  }, []);

  const onPressSend = async () => {
    // Send message to the relay
    console.log('Sending message:', text);
    console.log('receiver:', contact);
    const relay = await getRelayService();
    await relay.sendMessageTo(contact.publicKey, text);
    setText('');
  };

  return (
    <View style={styles.keyboardAvoidingContainer}>
      <Messages messages={messages} />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={(inputText: string) => {
            setText(inputText);
          }}
          value={text}
        />
        <TouchableOpacity style={styles.button} onPress={onPressSend}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#424242',
  },
  input: {
    flex: 1,
    fontSize: 16,
    borderRadius: 10,
    color: '#fff',
    backgroundColor: '#2d2d2d',
    paddingVertical: 5,
    margin: 10,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0e6f0e',
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ConversationScreen;
