import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveKeysToLocal = async (privKey: string, pubKey: string) => {
  try {
    await AsyncStorage.setItem('public-key', pubKey);
    await AsyncStorage.setItem('private-key', privKey);
  } catch (e) {
    // saving error
  }
};
