import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/AuthContext';
import {MusicProvider} from '../context/MusicContext';
import GlobalMiniPlayer from '../components/GlobalMiniPlayer';

// Import all screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import LibraryScreen from '../screens/library/LibraryScreen';
import PlayerScreen from '../screens/player/PlayerScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ArtistScreen from '../screens/artist/ArtistScreen';
import AlbumScreen from '../screens/album/AlbumScreen';
import PlaylistScreen from '../screens/playlist/PlaylistScreen';
import SpotifyPlaylistScreen from '../screens/SpotifyPlaylistScreen';
import AudioSettings from '../screens/settings/AudioSettings';
import PodcastScreen from '../screens/podcast/PodcastScreen';
import PodcastCategorieScreen from '../screens/podcast/podcastCategorieScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Basic Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'PodcastsTab') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'LibraryTab') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#000000f7',
          borderTopWidth: 0.4,
          height: 65,
          paddingBottom: 8,
          paddingTop: 15,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      })}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="PodcastsTab" component={PodcastScreen} options={{ title: 'Podcasts' }} />
      <Tab.Screen name="LibraryTab" component={LibraryScreen} options={{ title: 'Library' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Main App Navigation
const AppNav = () => {
  const auth = useAuth();
  const userToken = auth?.userToken;
  const isLoading = auth?.isLoading;
  const [isAppReady, setIsAppReady] = useState(false);
  const navigationRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = useState();

  useEffect(() => {
    // Simulate a short delay to ensure everything is initialized
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Listen to navigation changes
  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      setCurrentRoute(navigationRef.getCurrentRoute()?.name);
    });
    return () => unsubscribe && unsubscribe();
  }, [navigationRef]);

  if (isLoading || !isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Alpha Music</Text>
      </View>
    );
  }

  return (
    <MusicProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar backgroundColor="#000" barStyle="light-content" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken ? (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen name="Player" component={PlayerScreen} />
              <Stack.Screen name="Artist" component={ArtistScreen} />
              <Stack.Screen name="AlbumScreen" component={AlbumScreen} />
              <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
              <Stack.Screen name="SpotifyPlaylistScreen" component={SpotifyPlaylistScreen} />
              <Stack.Screen name="AudioSettings" component={AudioSettings} />
              <Stack.Screen name="PodcastCategorieScreen" component={PodcastCategorieScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
        <GlobalMiniPlayer isPlaylistOrAlbumScreen={currentRoute === 'PlaylistScreen' || currentRoute === 'AlbumScreen' || currentRoute === 'SpotifyPlaylistScreen'} />
      </NavigationContainer>
    </MusicProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  }
});

export default AppNav;
