/**
 * Utility to ensure TrackPlayer is properly set up
 * This helps avoid initialization issues across the app
 */

import TrackPlayer, { Capability, State } from 'react-native-track-player';
import { Platform } from 'react-native';

// Track the setup state globally
let isSetupAttempted = false;
let isSetupComplete = false;
let setupPromise = null;

/**
 * Ensures TrackPlayer is properly set up before use
 * @param {Object} options - Custom options to override defaults
 * @returns {Promise<boolean>} - True if setup was successful or already done
 */
export const ensureTrackPlayerSetup = async (options = {}) => {
  // If setup is already complete, just return true
  if (isSetupComplete) {
    return true;
  }

  // If we're already attempting setup, return the existing promise to avoid multiple concurrent setup calls
  if (setupPromise) {
    return setupPromise;
  }

  // Create a new setup promise
  setupPromise = (async () => {
    try {
      isSetupAttempted = true;
      console.log('Checking TrackPlayer state...');

      // Check if player is already initialized
      let isInitialized = false;
      try {
        // Try querying the player state to check if it's initialized
        const state = await TrackPlayer.getState();
        isInitialized = state !== null && state !== undefined;
        console.log('TrackPlayer current state:', state);
      } catch (error) {
        console.log('TrackPlayer not initialized:', error.message);
        isInitialized = false;
      }

      // If already initialized, we're done
      if (isInitialized) {
        console.log('TrackPlayer is already initialized');
        isSetupComplete = true;
        return true;
      }

      // Default options with good memory efficiency
      const defaultOptions = {
        minBuffer: 2,
        maxBuffer: 15,
        playBuffer: 2,
        backBuffer: 0,
        waitForBuffer: true,
        androidAudioContentType: 'music', // Optimize for music on Android
      };

      // Merge with any provided options
      const setupOptions = { ...defaultOptions, ...options };

      // Set up the player
      console.log('Setting up TrackPlayer with options:', setupOptions);
      await TrackPlayer.setupPlayer(setupOptions).catch(error => {
        // Special handling for "already initialized" error
        if (error.message && error.message.includes('already been initialized')) {
          console.log('TrackPlayer already initialized (caught in setupPlayer)');
          return true; // This is actually a success case
        }
        throw error; // Rethrow any other errors
      });
      
      // Configure capabilities for notifications
      const capabilities = [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ];

      // Platform-specific options
      const platformOptions = Platform.select({
        android: {
          appKilled: {
            keepNotification: true,
          },
          // Notification settings for Android
          notification: {
            channelId: 'com.alphamusic.playback',
            color: 0x1DB954, // Green color in hex
          },
        },
        ios: {
          // iOS-specific options
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
          ],
        },
      });

      // Update player options
      console.log('Updating TrackPlayer options');
      await TrackPlayer.updateOptions({
        capabilities,
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        ...platformOptions,
      });

      console.log('TrackPlayer setup complete');
      isSetupComplete = true;
      return true;
    } catch (error) {
      // Handle "already initialized" error which is actually a success
      if (error.message && error.message.includes('already been initialized')) {
        console.log('TrackPlayer was already initialized');
        isSetupComplete = true;
        return true;
      }
      
      console.error('Error setting up TrackPlayer:', error);
      isSetupComplete = false;
      return false;
    } finally {
      // Clear the promise to allow future setup attempts if needed
      setupPromise = null;
    }
  })();

  // Return the promise
  return setupPromise;
};

/**
 * Resets the player correctly without using destroy()
 * @returns {Promise<boolean>} - Success of the reset operation
 */
export const resetTrackPlayer = async () => {
  try {
    // Don't call destroy, it doesn't exist and causes errors
    // Instead, use reset which is safer
    await TrackPlayer.reset();
    
    // Reset our state tracking
    isSetupAttempted = false;
    isSetupComplete = false;
    setupPromise = null;
    
    console.log('TrackPlayer reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting TrackPlayer:', error);
    return false;
  }
};

export default ensureTrackPlayerSetup; 