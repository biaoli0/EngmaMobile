import React, { useState } from 'react';

import { View, Text, TextInput, Button, StyleSheet, Platform } from 'react-native';
import { useUser } from '../hooks/useUser';

const EnterKeysScreen = ({ navigation }) => {
  const { saveNewUser } = useUser();

  const [publicKey, setPublicKey] = useState(
    Platform.OS === 'ios'
      ? 'f22e82ed12d562fa35906c93f36e664d27a1be1426ad7f23c1a9595996bc6c2c'
      : '51fabec863db0f9364ba97ea9855f232272fc2a444bd60a913574a03a8d07301',
  );
  const [privateKey, setPrivateKey] = useState(
    Platform.OS === 'ios'
      ? 'cdaa3c71fea383ef59e4d36b78f6d6c98c2f468b5e87665533967ab7c28d84d1'
      : '41e5b5eef71a082849a5946956602e52d52b96bf227053d7e39ee3d45edb7e38',
  );

  const handleSubmit = async () => {
    saveNewUser(privateKey, publicKey);
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
