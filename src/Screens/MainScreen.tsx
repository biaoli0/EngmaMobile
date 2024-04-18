import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import ContactListScreen from './ContactListScreen';
import ChatsScreen from './ChatsScreen';

const Tab = createBottomTabNavigator();

const MainScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubble-sharp' : 'chatbubble-outline';
          } else if (route.name === 'Contacts') {
            iconName = focused ? 'people' : 'people-outline';
            // } else if (route.name === 'Me') {
            //   iconName = focused ? 'ios-person' : 'ios-person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chats" component={ChatsScreen} />
      <Tab.Screen name="Contacts" component={ContactListScreen} />
    </Tab.Navigator>
  );
};

export default MainScreen;
