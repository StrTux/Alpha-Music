import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  StatusBar,
  LogBox,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  AppState,
} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNav from './src/navigation/AppNav';
import {resetPlayer} from './src/utils/resetPlayer';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/Ionicons';

// Ignore specific warnings that come from third-party libraries
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Require cycle:',
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Non-serializable values were found in the navigation state',
  'The "EXNativeModulesProxy" native module is not exported',
  'The global process.env.EXPO_OS is not defined',
]);

// Enhanced network status component
const NetworkStatusBar = ({isConnected, onRetry}) => {
  if (isConnected) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.networkStatusBar}
      onPress={onRetry}
      activeOpacity={0.7}>
      <Icon name="cloud-offline-outline" size={20} color="#fff" />
      <Text style={styles.networkStatusText}>
        No internet connection. Tap to retry.
      </Text>
    </TouchableOpacity>
  );
};

// Setup track player with proper error handling and timeout
const setupTrackPlayer = async () => {
  try {
    // Add a timeout to the setup process to avoid hanging
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TrackPlayer setup timeout')), 8000);
    });

    // Try to check if player is already running
    const isSetupPromise = TrackPlayer.isServiceRunning().catch(e => {
      console.log('Error checking if player is running, assuming not setup');
      return false;
    });

    // Race the check against the timeout
    const isSetup = await Promise.race([isSetupPromise, timeout]);

    if (isSetup) {
      console.log('TrackPlayer is already setup, skipping initialization');
      return true;
    }

    // Setup the player with options, racing against timeout
    const setupPromise = TrackPlayer.setupPlayer({
      minBuffer: 10,
      maxBuffer: 30,
      playBuffer: 2,
      backBuffer: 0,
    });

    await Promise.race([setupPromise, timeout]);

    // Update player options with capabilities
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      stopWithApp: true,
    });

    return true;
  } catch (error) {
    console.error('Error setting up Track Player:', error);
    return false;
  }
};

const App = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [setupError, setSetupError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });
  const appState = useRef(AppState.currentState);
  const setupRetryCount = useRef(0);
  const maxRetries = 3;

  // Check network status
  const checkNetworkStatus = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      console.log('Network state:', state);

      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }, []);

  // Handle network retry button press
  const handleNetworkRetry = useCallback(() => {
    checkNetworkStatus();
  }, [checkNetworkStatus]);

  // Monitor network status
  useEffect(() => {
    // Initial check
    checkNetworkStatus();

    // Set up listener for network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => unsubscribe();
  }, [checkNetworkStatus]);

  // Initialize player
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        setIsLoading(true);
        setSetupError(null);

        const success = await setupTrackPlayer();
        
        if (success) {
          setIsPlayerReady(true);
          console.log('Connected to music API successfully');
        } else {
          throw new Error('Failed to setup TrackPlayer');
        }
      } catch (error) {
        console.error('Error initializing player:', error);
        setSetupError(error.message);
        setupRetryCount.current += 1;
      } finally {
        setIsLoading(false);
      }
    };

    initializePlayer();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => subscription?.remove();
  }, []);

  const handleResetPlayer = async () => {
    try {
      setIsLoading(true);
      setSetupError(null);
      setupRetryCount.current = 0;

      await resetPlayer();
      await setupTrackPlayer();

      setIsPlayerReady(true);
    } catch (error) {
      console.error('Error resetting player:', error);
      setSetupError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while player initializes
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Initializing player...</Text>
      </View>
    );
  }

  // Show error screen if setup failed
  if (setupError) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{setupError}</Text>
        <Text style={styles.infoText}>
          There was a problem initializing the music player.
        </Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleResetPlayer}>
          <Text style={styles.buttonText}>Reset Player & Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main App with providers and network status bar
  const isNetworkAvailable =
    networkStatus.isConnected && networkStatus.isInternetReachable;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={styles.container}>
        <AppNav />
        <NetworkStatusBar
          isConnected={isNetworkAvailable}
          onRetry={handleNetworkRetry}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
    fontWeight: 'bold',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  networkStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  networkStatusText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;
