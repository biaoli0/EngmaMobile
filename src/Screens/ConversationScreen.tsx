import React, { useEffect } from 'react';

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

import { Contact, Message } from '../types';
import Messages from '../Messages';
import { KINDS, getRelayService } from '../RelayService';
import { Event } from 'nostr-tools';

// A screen to show the first message of all conversation
const ConversationScreen = ({ route }) => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [text, setText] = React.useState('');
  const { contact } = route.params;

  useEffect(() => {
    const getMessages = async () => {
      console.log('calling getMessages()');
      if (contact && contact.publicKey) {
        console.log('contact: ', route.params.contact);
        const relay = await getRelayService();
        const filter1 = {
          authors: [relay.getPublicKey()],
          kinds: [KINDS.DIRECT_MESSAGE],
          '#p': [contact.publicKey],
        };
        const filter2 = {
          authors: [contact.publicKey],
          kinds: [KINDS.DIRECT_MESSAGE],
          '#p': [relay.getPublicKey()],
        };

        await relay.subscribeToEvent([filter1, filter2], (event: Event) => {
          const { content, id, created_at: createdAt, pubkey } = event || {};
          const newMessage: Message = { id, text: content, createdAt, publicKey: pubkey };
          const newMessages = [...messages, newMessage].sort((a, b) => a.createdAt - b.createdAt);
          setMessages(newMessages);
        });
      }
    };

    getMessages();
  }, []);

  const onPressSend = async () => {
    // Send message to the relay
    console.log('Sending message:', text);
    const relay = await getRelayService();
    await relay.sendMessageTo(contact.publicKey, text);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Messages messages={messages} />
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
