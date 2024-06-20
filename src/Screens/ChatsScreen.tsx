import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Message as BaseMessage, Contact } from '../types';
import { emptyMessage } from '../constants';
import { KINDS, getRelayService } from '../models/RelayService';
import { Event } from 'nostr-tools';

type Message = BaseMessage & { convoWith: Contact };

const ChatsScreen = ({ navigation }) => {
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [newMessage, setNewMessage] = useState<Message>(emptyMessage);

  const chatItems = Object.entries(messages)
    .map(([, message]) => {
      return message;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  useEffect(() => {
    if (newMessage.id !== emptyMessage.id) {
      if (
        !messages[newMessage.publickey] ||
        messages[newMessage.publickey].createdAt < newMessage.createdAt
      ) {
        const newMessages = { ...messages, [newMessage.convoWith.publicKey]: newMessage };
        setMessages(newMessages);
      }
    }
  }, [newMessage]);

  useEffect(() => {
    const getMessages = async () => {
      console.log('calling getMessages()');
      const relay = await getRelayService();
      const myPubkey = relay.getPublicKey();
      const { name: myName } = await relay.getUserProfile(myPubkey);
      const friends = await relay.fetchFriendList();

      const filters = Object.keys(friends)
        .map((friendPubKey) => {
          const filter1 = {
            authors: [myPubkey],
            kinds: [KINDS.DIRECT_MESSAGE],
            '#p': [friendPubKey],
          };
          const filter2 = {
            authors: [friendPubKey],
            kinds: [KINDS.DIRECT_MESSAGE],
            '#p': [myPubkey],
          };
          return [filter1, filter2];
        })
        .flat();

      await relay.subscribeToEvent(filters, (event: Event) => {
        const { content, id, created_at: createdAt, pubkey } = event || {};
        const date = new Date(createdAt);
        const formattedDate = date.toLocaleTimeString();

        const newMessage: Message = {
          id,
          avatar: 'https://via.placeholder.com/40',
          user: pubkey === myPubkey ? myName : friends[pubkey].name,
          publickey: pubkey,
          text: content,
          createdAt,
          isCurrentUser: pubkey === myPubkey,
          time: formattedDate,
          convoWith: { publicKey: pubkey, name: friends[pubkey].name },
        };
        setNewMessage(newMessage);
      });
    };

    getMessages();
  }, []);

  const handlePress = (item: Message) => () => {
    navigation.navigate('ConversationScreen', {
      contact: { name: item.user, publicKey: item.publickey },
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
