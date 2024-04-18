import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider } from 'react-native-paper';

import React from 'react';
import WelcomeScreen from './src/Screens/WelcomeScreen';
import EnterKeysScreen from './src/Screens/EnterKeysScreen';
import GenerateKeysScreen from './src/Screens/GenerateKeysScreen';
import MainScreen from './src/Screens/MainScreen';
import DropdownMenu from './src/components/DropdownMenu';
import WebSocketProvider from './src/contexts/WebSocketProvider';
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <WebSocketProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="WelcomeScreen">
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{ title: 'Engma' }}
            />
            <Stack.Screen
              name="EnterKeysScreen"
              component={EnterKeysScreen}
              options={{ title: 'Engma' }}
            />
            <Stack.Screen
              name="GenerateKeysScreen"
              component={GenerateKeysScreen}
              options={{ title: 'Engma' }}
            />
            <Stack.Screen
              name="MainScreen"
              component={MainScreen}
              options={{
                title: 'Engma',
                headerRight: () => <DropdownMenu />,
              }}
            />
            {/* Register other screens here */}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </WebSocketProvider>
  );
}

export default App;
