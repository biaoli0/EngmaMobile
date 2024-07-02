import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Message as BaseMessage, Contact } from '../types';
import { emptyMessage } from '../constants';
import { KINDS, useRelayService } from '../models/RelayService';
import { Event } from 'nostr-tools';
import { useContact } from '../hooks/useContact';
import { useUser } from '../hooks/useUser';

type Message = BaseMessage & { convoWith: Contact };

const ChatsScreen = ({ navigation }) => {
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [newMessage, setNewMessage] = useState<Message>(emptyMessage);
  const { contacts } = useContact();
  const { getProfile } = useUser();

  const RS = useRelayService();

  const chatItems = Object.entries(messages)
    .map(([, message]) => {
      return message;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    if (newMessage.id !== emptyMessage.id) {
      if (
        !messages[newMessage.publicKey] ||
        messages[newMessage.publicKey].createdAt < newMessage.createdAt
      ) {
        const newMessages = { ...messages, [newMessage.convoWith.publicKey]: newMessage };
        setMessages(newMessages);
      }
    }
  }, [newMessage]);

  const handlePress = (item: Message) => () => {
    navigation.navigate('ConversationScreen', {
      contact: { name: item.user, publicKey: item.publicKey },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatList}>
        {chatItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.chatItem} onPress={handlePress(item)}>
            <Image source={{ uri: item.avatar }} style={styles.chatIcon} />
            <View style={styles.chatText}>
              <Text style={styles.chatTitle}>{item.user}</Text>
              <Text style={styles.chatSubtitle}>{item.text}</Text>
            </View>
            <Text style={styles.chatTime}>{item.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
    backgroundColor: '#181818',
  },
  chatIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  chatText: {
    flex: 1,
    marginLeft: 16,
  },
  chatTitle: {
    color: '#C8C8C8',
    fontSize: 14,
    paddingBottom: 2,
  },
  chatSubtitle: {
    color: '#434343',
    fontSize: 11,
  },
  chatTime: {
    color: '#434343',
    fontSize: 11,
  },
});

export default ChatsScreen;
