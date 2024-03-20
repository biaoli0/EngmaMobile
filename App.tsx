import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import WelcomeScreen from './src/Screens/WelcomeScreen';
const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen">
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{ title: 'Engma' }}
        />
        {/* Register other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
