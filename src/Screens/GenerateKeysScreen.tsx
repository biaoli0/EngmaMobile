import Clipboard from '@react-native-clipboard/clipboard';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { generatePrivKey, getPubKey } from '../constants';
import { useUser } from '../hooks/useUser';

const GenerateKeysScreen = ({ navigation }) => {
  const { saveNewUser, updateProfile } = useUser();
  const [privKey, setPrivKey] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const updateProfileName = async () => {
    await updateProfile(publicKey.substring(0, 6));
  };

  useEffect(() => {
    const fetchData = async () => {
      console.log('calling fetchData() in GenerateKeysScreen');
      try {
        const newPrivKey = await generatePrivKey();
        const newPublicKey = await getPubKey(newPrivKey);
        saveNewUser(newPrivKey, newPublicKey);
        setPrivKey(newPrivKey);
        setPublicKey(newPublicKey);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  // Function to copy text
  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'The text has been copied to your clipboard.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Public Key</Text>
      <TouchableOpacity onPress={() => copyToClipboard(publicKey)} style={styles.keyContainer}>
        <Text style={styles.keyText}>{publicKey}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Private Key</Text>
      <TouchableOpacity onPress={() => copyToClipboard(privKey)} style={styles.keyContainer}>
        <Text style={styles.keyText}>{privKey}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          await updateProfileName();
          navigation.navigate('MainScreen');
        }}
        style={styles.keyContainer}
      >
        <Text style={styles.keyText}>done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  keyContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 10,
    width: '100%',
  },
  keyText: {
    fontSize: 16,
  },
});

export default GenerateKeysScreen;
