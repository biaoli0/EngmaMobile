import React, { useState } from 'react';

import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { saveKeysToLocal } from '../utils/saveKeysToLocal';
import { resetRelayService } from '../models/RelayService';

const EnterKeysScreen = ({ navigation }) => {
  const [publicKey, setPublicKey] = useState(
    'f22e82ed12d562fa35906c93f36e664d27a1be1426ad7f23c1a9595996bc6c2c',
  );
  const [privateKey, setPrivateKey] = useState(
    'cdaa3c71fea383ef59e4d36b78f6d6c98c2f468b5e87665533967ab7c28d84d1',
  );

  const handleSubmit = async () => {
    await saveKeysToLocal(privateKey, publicKey);
    await resetRelayService();
    navigation.navigate('MainScreen');
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
