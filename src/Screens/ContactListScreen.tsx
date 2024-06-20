import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getRelayService } from '../models/RelayService';
import { Contact } from '../types';

const ContactListScreen = ({ navigation }) => {
  const [friendList, setFriendList] = useState<Contact[]>([]);
  useEffect(() => {
    const getFollowList = async () => {
      console.log('calling getFollowList()');
      const relay = await getRelayService();

      const newFriendList = await relay.fetchFriendList();
      setFriendList(
        Object.entries(newFriendList).map(([publicKey, { name }]) => {
          return { publicKey, name };
        }),
      );
    };

    getFollowList();
  }, []);

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
    <FlatList data={friendList} renderItem={renderItem} keyExtractor={(item) => item.publicKey} />
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
