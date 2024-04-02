import React from 'react';
import * as secp from '@noble/secp256k1';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Input, bytesToHex } from '@noble/hashes/utils';
import { getPubKey, getLocalPrivKey } from '../constants';
import { v2 } from '../utils/encryption';
import { Message } from '../types';
import { getSignedEvent } from '../utils/getSignedEvent';
import Messages from '../Messages';

const ConversationScreen = async ({ navigation }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [text, setText] = React.useState('');

  const relay = 'wss://relay.damus.io';
  const socket = new WebSocket(relay);
  const privKey = await getLocalPrivKey();
  if (!privKey) {
    navigation.navigate('WelcomeScreen');
    return null;
  }
  const pubKey = getPubKey(privKey);
  const conversationKey = v2.utils.getConversationKey(privKey, pubKey);

  // Subscribe to the relay
  socket.onopen = () => {
    console.log('connected to ' + relay);
    setMessages([]);
    const subId = bytesToHex(secp.utils.randomPrivateKey()).substring(0, 16);
    const filter = { authors: [pubKey] };

    const subscription = ['REQ', subId, filter];
    console.log('Subscription:', subscription);

    socket.send(JSON.stringify(subscription));
  };

  // Log any messages the relay sends you
  socket.onmessage = async (message) => {
    console.log('receiving message:', message);
    const [type, subId, event] = JSON.parse(message.data);
    if (type === 'EVENT') {
      const { kind, content: encryptedContent, id } = event || {};
      console.log('encryptedContent on receive:', encryptedContent);

      const content = v2.decrypt(encryptedContent, conversationKey);
      console.log('content: ', content);

      if (!event || event === true) return;

      // if (kind === 4) {
      //   content = await decrypt(privKey, event.pubkey, content);
      // }

      setMessages([...messages, { id, text: content }]);
      // window.scrollTo(0, document.body.scrollHeight);
    }
  };

  const onPressSend = async () => {
    // Send message to the relay
    console.log('Sending message:', text);
    const content = v2.encrypt(text, conversationKey);
    console.log('encryptedContent:', content);

    const event = {
      content,
      created_at: Math.floor(Date.now() / 1000),
      kind: 1,
      tags: [],
      pubkey: pubKey,
    };
    const signedEvent = await getSignedEvent(event, privKey);
    console.log('signedEvent:', signedEvent);
    socket.send(JSON.stringify(['EVENT', signedEvent]));

    // Clear input after sending
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Messages messages={messages} />
      </ScrollView>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          onSubmitEditing={() => Keyboard.dismiss()} // Dismiss keyboard when submitted
          onChangeText={(inputText: string) => {
            setText(inputText);
          }}
          value={text}
        />
        <TouchableOpacity style={styles.button} onPress={onPressSend}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30, // Adjust this value to accommodate the height of child2
  },
  keyboardAvoidingContainer: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 10,
    position: 'absolute',
    bottom: 0, // Stick to the bottom
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  button: {
    marginLeft: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#841584',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConversationScreen;
