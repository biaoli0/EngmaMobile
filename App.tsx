import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import WelcomeScreen from './src/Screens/WelcomeScreen';
import EnterKeysScreen from './src/Screens/EnterKeysScreen';
import ContactListScreen from './src/Screens/ContactListScreen';
import GenerateKeysScreen from './src/Screens/GenerateKeysScreen';
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ title: 'Engma' }} />
        <Stack.Screen
          name="EnterKeysScreen"
          component={EnterKeysScreen}
          options={{ title: 'Engma' }}
        />
        <Stack.Screen
          name="ContactListScreen"
          component={ContactListScreen}
          options={{ title: 'Engma' }}
        />
        <Stack.Screen
          name="GenerateKeysScreen"
          component={GenerateKeysScreen}
          options={{ title: 'Engma' }}
        />

        {/* Register other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
