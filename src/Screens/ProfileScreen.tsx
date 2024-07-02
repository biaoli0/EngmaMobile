import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRelayService } from '../models/RelayService';
import { useUser } from '../hooks/useUser';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const RS = useRelayService();
  const { getProfile, updateProfile } = useUser();

  const handleSubmit = async () => {
    await updateProfile(name);
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('calling fetchData() in ProfileScreen');
      const { name = 'Please enter your new profile name' } = await getProfile(RS.getPublicKey());
      setName(name);
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput style={styles.input} onChangeText={setName} value={name} />
      <Button title="Save" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default ProfileScreen;
