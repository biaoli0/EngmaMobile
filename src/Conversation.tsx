import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';

interface Message {
  id: number;
  text: string;
}

interface Props {
  messages: Message[];
}

const Messages: React.FC<Props> = ({ messages }) => {
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id.toString()}
      inverted // To show the latest message at the bottom
    />
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  messageText: {
    fontSize: 16,
  },
});

export default Messages;
