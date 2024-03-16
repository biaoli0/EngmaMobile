import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Message } from './types';

interface Props {
  messages: Message[];
}

const Messages: React.FC<Props> = ({ messages }) => {
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer} key={item.id}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <FlatList
      style={{ height: '90%', position: 'absolute', width: '100%' }}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id.toString()}
      //   inverted // To show the latest message at the bottom
    />
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  messageText: {
    fontSize: 16,
  },
});

export default Messages;
