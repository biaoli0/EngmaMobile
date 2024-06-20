import React from 'react';
import { View, FlatList, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Message } from './types';

interface Props {
  messages: Message[];
}

const Messages: React.FC<Props> = ({ messages }) => {
  const renderMessage = ({ item }: { item: Message }) => {
    const { user, text, avatar, isCurrentUser } = item;

    return (
      <View
        key={item.id}
        style={[styles.messageContainer, isCurrentUser ? styles.currentUser : styles.otherUser]}
      >
        {!isCurrentUser && <Image source={{ uri: avatar }} style={styles.avatar} />}
        <View>
          {!isCurrentUser && <Text style={styles.user}>{user}</Text>}
          <View
            style={[
              styles.messageBubble,
              isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
            ]}
          >
            <Text style={styles.messageText}>{text}</Text>
          </View>
        </View>
        {isCurrentUser && <Image source={{ uri: avatar }} style={styles.avatar} />}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {messages.map((message) => {
        return renderMessage({ item: message });
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  currentUser: {
    justifyContent: 'flex-end',
  },
  otherUser: {
    justifyContent: 'flex-start',
  },
  user: {},
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 10,
  },
  currentUserBubble: {
    backgroundColor: '#16a34a',
    color: '#0e0e0e',
  },
  otherUserBubble: {
    backgroundColor: '#374151',
    color: '#fff',
  },
  messageText: {
    color: '#fff',
  },
  timestamp: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default Messages;
