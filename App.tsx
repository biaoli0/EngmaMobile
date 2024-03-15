/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import * as secp from '@noble/secp256k1';

// 3. React Native needs crypto.getRandomValues polyfill and sha512
import 'react-native-get-random-values';
import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
secp.etc.hmacSha256Sync = (k, ...m) => hmac(sha256, k, secp.etc.concatBytes(...m));
secp.etc.hmacSha256Async = (k, ...m) => Promise.resolve(secp.etc.hmacSha256Sync(k, ...m));

import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Messages from './src/Messages';
import { bytesToHex } from './src/utils/hex';
import { privKey, getPubKey } from './src/constants';
import { getSignedEvent } from './src/utils/getSignedEvent';

const relay = 'wss://relay.damus.io';
const socket = new WebSocket(relay);
const pubKey = getPubKey();

function App(): React.JSX.Element {
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState('');

  const onChangeText = (inputText: string) => {
    setText(inputText);
  };

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
    console.log('receiving messages', message);
    const [type, subId, event] = JSON.parse(message.data);
    const { kind, content } = event || {};
    if (!event || event === true) return;

    // if (kind === 4) {
    //   content = await decrypt(privKey, event.pubkey, content);
    // }

    setMessages([...messages, { id: messages.length, text: content }]);
    // window.scrollTo(0, document.body.scrollHeight);
  };

  const onPressSend = async () => {
    // Implement send functionality here
    console.log('Sending message:', text);

    const event = {
      content: text,
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
          onChangeText={onChangeText}
          value={text}
        />
        <TouchableOpacity style={styles.button} onPress={onPressSend}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

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

export default App;
