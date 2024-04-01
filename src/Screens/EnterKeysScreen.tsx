import React, { useState } from 'react';

import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { saveKeysToLocal } from '../utils/saveKeysToLocal';

const EnterKeysScreen = ({ navigation }) => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleSubmit = async () => {
    // Handle the submission of the keys
    await saveKeysToLocal(privateKey, publicKey);
    navigation.navigate('ContactListScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Public Key</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPublicKey}
        value={publicKey}
        placeholder="Enter your public key"
        autoCapitalize="none"
      />
      <Text style={styles.label}>Private Key</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPrivateKey}
        value={privateKey}
        placeholder="Enter your private key"
        secureTextEntry // This hides the private key as it's entered
        autoCapitalize="none"
      />
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 10,
  },
});

export default EnterKeysScreen;
