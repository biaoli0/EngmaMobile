import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Contact } from '../types';
import { useContact } from '../hooks/useContact';

const ContactListScreen = ({ navigation }) => {
  const { contacts } = useContact();

  const handlePress = (item: Contact) => () => {
    navigation.navigate('ConversationScreen', {
      contact: item,
    });
  };
  const renderItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={{}} onPress={handlePress(item)}>
      <View style={styles.itemContainer}>
        <Text style={styles.itemText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList data={contacts} renderItem={renderItem} keyExtractor={(item) => item.publicKey} />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 10,
    borderBottomColor: '#cccccc',
    borderBottomWidth: 0.5,
  },
  itemText: {
    fontSize: 14,
  },
});

export default ContactListScreen;
