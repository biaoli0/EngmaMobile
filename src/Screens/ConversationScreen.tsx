import React, { useContext } from 'react';

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

import { getPubKey, getLocalPrivKey } from '../constants';
import { v2 } from '../utils/encryption';
import { Message } from '../types';
import { getSignedEvent } from '../utils/getSignedEvent';
import Messages from '../Messages';
import WebSocketContext from '../contexts/WebSocketContext';

const ConversationScreen = async () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [text, setText] = React.useState('');
  const socket = useContext(WebSocketContext);
  if (!socket) {
    throw new Error('Socket is not available');
  }

  const privKey = await getLocalPrivKey();
  const pubKey = getPubKey(privKey);

  const conversationKey = v2.utils.getConversationKey(privKey, pubKey);

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
    // socket.send(JSON.stringify(['EVENT', signedEvent]));

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
