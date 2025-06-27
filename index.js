/**
 * @format
 */

import React from 'react';
import 'react-native-gesture-handler';
import {AppRegistry, Text, LogBox} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider} from './src/context/AuthContext';
import {MusicProvider} from './src/context/MusicContext';
import {CachedDataProvider} from './src/contexts/CachedDataContext';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';

// Log app name for debugging
console.log('Registering app with name:', appName);

// Prevent font scaling
Text.defaultProps = {
  ...(Text.defaultProps || {}),
  allowFontScaling: false,
};

// Ignore specific warnings related to TrackPlayer
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Require cycle:',
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  '[TrackPlayer]', // Ignore TrackPlayer verbose logs
]);

TrackPlayer.registerPlaybackService(() => require('./src/services/trackPlayerService'));

// Main component that wraps all providers around the App
const Main = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <MusicProvider>
        <CachedDataProvider>
          <App />
        </CachedDataProvider>
      </MusicProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

// Register the main component
AppRegistry.registerComponent(appName, () => Main);

