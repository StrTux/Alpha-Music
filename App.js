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
import { testApiConnection } from './src/utils/apiTester';
import { runStartupDiagnostics } from './src/utils/diagnostics';
import { BASE_URL } from './src/config/constants';

// Run diagnostics on app launch
runStartupDiagnostics().then(result => {
  if (!result.ready) {
    console.warn('⚠️ App not fully ready. Some features may not work correctly.');
  } else {
    console.log('✅ Startup diagnostics completed successfully. App ready.');
  }
}).catch(error => {
  console.error('❌ Error during startup diagnostics:', error);
});

// Ignore specific warnings that come from third-party libraries
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Require cycle:',
  'Warning: componentWillReceiveProps',
  'Warning: componentWillMount',
  'Non-serializable values were found in the navigation state',
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
  const [crashCount, setCrashCount] = useState(0);
  const [networkStatus, setNetworkStatus] = useState({
    isConnected: true,
    isInternetReachable: true,
  });
  const [offlineMode, setOfflineMode] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isConnected: false,
    error: null,
    lastChecked: null
  });
  const appState = useRef(AppState.currentState);
  const setupRetryCount = useRef(0);
  const maxRetries = 3;
  const networkRetryCount = useRef(0);

  // Check network status with retry and offline mode switching
  const checkNetworkStatus = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      console.log('Network state:', state);

      setNetworkStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
      });

      // If connected, reset retry count
      if (state.isConnected && state.isInternetReachable) {
        networkRetryCount.current = 0;

        // If we were in offline mode but now online, exit offline mode
        if (offlineMode) {
          setOfflineMode(false);
          console.log('Exiting offline mode, network is available');
        }
      } else {
        // If disconnected, increment retry count
        networkRetryCount.current += 1;

        // After 3 retries with no connection, switch to offline mode
        if (networkRetryCount.current >= 3 && !offlineMode) {
          setOfflineMode(true);
          console.log(
            'Entering offline mode after multiple connection failures',
          );
        }
      }

      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }, [offlineMode]);

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

      // If we regain connection and were in offline mode, exit offline mode
      if (state.isConnected && state.isInternetReachable && offlineMode) {
        setOfflineMode(false);
        console.log('Network connection restored, exiting offline mode');
      }
    });

    // Check connection every 30 seconds when in offline mode
    let intervalId;
    if (offlineMode) {
      intervalId = setInterval(() => {
        checkNetworkStatus();
      }, 30000);
    }

    return () => {
      unsubscribe();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [offlineMode, checkNetworkStatus]);

  // Monitor app state to handle background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        // Check network status when app is resumed
        checkNetworkStatus();

        if (!isPlayerReady && setupRetryCount.current < maxRetries) {
          console.log('App resumed, retrying player setup');
          setupRetryCount.current += 1;
          setupTrackPlayer();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isPlayerReady, checkNetworkStatus]);

  // Handle errors globally
  useEffect(() => {
    // Set up global error handler
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error, isFatal) => {
      // Log the error
      console.error(`Global Error (${isFatal ? 'Fatal' : 'NonFatal'}):`, error);

      // Update crash count for fatal errors only
      if (isFatal) {
        setCrashCount(prev => prev + 1);
      }

      // Call original handler
      originalErrorHandler(error, isFatal);
    });

    return () => {
      // Restore original handler when component unmounts
      ErrorUtils.setGlobalHandler(originalErrorHandler);
    };
  }, []);

  // Setup TrackPlayer on app start with retries
  useEffect(() => {
    let mounted = true;
    setupRetryCount.current = 0;

    const initializePlayer = async () => {
      if (setupRetryCount.current >= maxRetries) {
        console.log(
          `Max retry count (${maxRetries}) reached, giving up on setup`,
        );
        if (mounted) {
          setSetupError(
            'Failed to initialize audio player after multiple attempts',
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        if (mounted) {
          setIsLoading(true);
        }

        const setupSuccess = await setupTrackPlayer();

        if (!mounted) {
          return;
        }

        if (setupSuccess) {
          setIsPlayerReady(true);
          setSetupError(null);
        } else {
          setupRetryCount.current += 1;

          if (setupRetryCount.current < maxRetries) {
            console.log(`Retry ${setupRetryCount.current} of ${maxRetries}`);
            setTimeout(initializePlayer, 1000);
            return;
          } else {
            setSetupError(
              'Failed to initialize audio player after multiple attempts',
            );
            console.error(
              'Max retries reached, giving up on player initialization',
            );
          }
        }
      } catch (error) {
        console.error('Unexpected error during setup:', error);

        if (!mounted) {
          return;
        }

        setupRetryCount.current += 1;
        if (setupRetryCount.current < maxRetries) {
          setTimeout(initializePlayer, 1000);
          return;
        } else {
          setSetupError(`Player initialization error: ${error.message}`);
          setIsPlayerReady(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
      if (isPlayerReady) {
        TrackPlayer.reset().catch(err => {
          console.error('Error resetting TrackPlayer:', err);
        });
      }
    };
  }, [crashCount, isPlayerReady]);

  // Reset player and try again if setup failed
  const handleResetPlayer = async () => {
    try {
      setIsLoading(true);
      setSetupError(null);
      await resetPlayer();
      setupRetryCount.current = 0;
      setCrashCount(prev => prev + 1); // Force re-initialization
    } catch (error) {
      console.error('Error resetting player:', error);
      setSetupError(`Failed to reset player: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Check API connection status
  const checkApiStatus = useCallback(async () => {
    if (!networkStatus.isConnected || !networkStatus.isInternetReachable) {
      return false;
    }

    try {
      const result = await testApiConnection();
      
      setApiStatus({
        isConnected: result.isConnected,
        error: result.error,
        lastChecked: new Date().toISOString(),
        baseUrl: BASE_URL
      });
      
      if (result.isConnected) {
      } else {
        console.error('Failed to connect to music API:', result.error);
      }
      
      return result.isConnected;
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus({
        isConnected: false,
        error: error.message,
        lastChecked: new Date().toISOString(),
        baseUrl: BASE_URL
      });
      return false;
    }
  }, [networkStatus.isConnected, networkStatus.isInternetReachable]);

  // Check API status on app start and when network changes
  useEffect(() => {
    if (networkStatus.isConnected && networkStatus.isInternetReachable) {
      checkApiStatus();
    }
  }, [networkStatus, checkApiStatus]);

  // Handle API retry button press
  const handleApiRetry = useCallback(async () => {
    setIsLoading(true);
    await checkApiStatus();
    setIsLoading(false);
  }, [checkApiStatus]);

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

  // Show API error screen if we have network but API is unreachable
  if (networkStatus.isConnected && networkStatus.isInternetReachable && !apiStatus.isConnected && !isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Music API Connection Error</Text>
        <Text style={styles.infoText}>
          Unable to connect to the music service. The API at {apiStatus.baseUrl} is not responding.
        </Text>

        <View style={styles.errorDetails}>
          <Text style={styles.errorDetailText}>Error: {apiStatus.error || 'Unknown error'}</Text>
          <Text style={styles.errorDetailText}>Base URL: {BASE_URL}</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleApiRetry}>
          <Text style={styles.buttonText}>Check API Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#555', marginTop: 10 }]}
          onPress={() => setOfflineMode(true)}>
          <Text style={[styles.buttonText, { color: '#fff' }]}>Continue in Offline Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main App with providers and network status bar
  try {
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
          <ApiStatusBar
            apiStatus={apiStatus}
            onRetry={handleApiRetry}
          />
        </View>
      </>
    );
  } catch (error) {
    console.error('Error in App component:', error);

    // Fallback UI in case providers fail to load
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          There was an error loading the app.
        </Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleResetPlayer}>
          <Text style={styles.buttonText}>Reset & Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

// API Status Bar component
const ApiStatusBar = ({ apiStatus, onRetry }) => {
  if (apiStatus.isConnected) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.networkStatusBar, { backgroundColor: '#FF7700' }]}
      onPress={onRetry}
      activeOpacity={0.7}>
      <Icon name="server-outline" size={20} color="#fff" />
      <Text style={styles.networkStatusText}>
        Music API connection issue. Tap to retry.
      </Text>
    </TouchableOpacity>
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
  errorDetails: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    width: '90%',
  },
  errorDetailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;
