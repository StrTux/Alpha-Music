import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Resets the track player completely
 * This can be used when the player is in a broken state
 */
export const resetPlayer = async () => {
  try {
    // First try to destroy the player
    await TrackPlayer.destroy().catch(() => {});

    // Clear any stored player data
    await AsyncStorage.removeItem('playerQueue');
    await AsyncStorage.removeItem('currentTrack');

    // Setup the player again
    await TrackPlayer.setupPlayer({
      minBuffer: 15,
      maxBuffer: 50,
      playBuffer: 2,
      backBuffer: 0,
    });

    console.log('Player has been reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting player:', error);
    return false;
  }
};

/**
 * Clears the current queue and resets the player to a clean state
 * without destroying the service
 */
export const clearPlayerQueue = async () => {
  try {
    // Stop any current playback
    await TrackPlayer.pause().catch(() => {});

    // Reset the player (clear queue)
    await TrackPlayer.reset();

    console.log('Player queue has been cleared');
    return true;
  } catch (error) {
    console.error('Error clearing player queue:', error);
    return false;
  }
};

export default {resetPlayer, clearPlayerQueue};
