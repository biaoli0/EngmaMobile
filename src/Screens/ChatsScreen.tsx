import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../types';

// Sample data for chats
const chatData = [
  { id: '1', name: 'Friend 1', latestMessage: 'How are you?' },
  { id: '2', name: 'Friend 2', latestMessage: 'Let’s catch up tomorrow!' },
  { id: '3', name: 'Friend 3', latestMessage: 'Did you see that email?' },
  // ... more chats
];

const ChatsScreen = () => {
  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.chatItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage}>{item.latestMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={chatData}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D8D8D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    justifyContent: 'center',
    overflow: 'hidden',
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 16,
    color: '#757575',
  },
});

export default ChatsScreen;
