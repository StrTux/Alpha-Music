import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Library from '../screens/libraryTab/Library';
import Profile from '../screens/profileTab/Profile';
import ServerSettings from '../screens/settings/ServerSettings';
import SpotifyPlaylistScreen from '../screens/SpotifyPlaylistScreen';

const Stack = createNativeStackNavigator();

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Library" component={Library} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ServerSettings" component={ServerSettings} />
      <Stack.Screen name="SpotifyPlaylistScreen" component={SpotifyPlaylistScreen} />
    </Stack.Navigator>
  );
};

export default AppStack;
