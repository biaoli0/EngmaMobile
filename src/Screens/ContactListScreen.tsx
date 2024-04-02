import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const contacts = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Doe' },
  { id: '3', name: 'William Smith' },
  // Add more contacts as needed
];

const ContactListScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.name}</Text>
    </View>
  );

  return <FlatList data={contacts} renderItem={renderItem} keyExtractor={(item) => item.id} />;
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  itemText: {
    fontSize: 18,
  },
});

export default ContactListScreen;
