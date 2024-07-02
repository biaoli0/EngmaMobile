import React, { useState } from 'react';
import { View, TextInput, FlatList, StyleSheet } from 'react-native';
import NewContactPanel from '../components/NewContactPanel';
import { useUser } from '../hooks/useUser';

const ContactSearchScreen = () => {
  const [query, setQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const { getProfile } = useUser();

  const handleSearch = async (text) => {
    setQuery(text);
    const trimmedText = text.trim();
    if (trimmedText && trimmedText.length === 64) {
      try {
        const { name } = await getProfile(trimmedText);
        setFilteredContacts([{ id: 1, name, publicKey: trimmedText }]);
      } catch (e) {
        console.error(e);
      }

      //   const profileName = await subscription.onevent();
      //   setFilteredContacts(filteredData);
    } else {
      setFilteredContacts([]);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={handleSearch}
        placeholder="Search new contact by public key"
      />
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NewContactPanel newContact={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
});

export default ContactSearchScreen;
