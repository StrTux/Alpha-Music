import {useEffect} from 'react';
import TrackPlayer, {Capability, RepeatMode} from 'react-native-track-player';

const setupPlayer = async () => {
  try {
    // Check if the player is already setup
    const isSetup = await TrackPlayer.isServiceRunning();

    if (isSetup) {
      console.log('Player is already setup');
      return;
    }

    await TrackPlayer.setupPlayer({
      minBuffer: 30, // Minimum buffer size in seconds
      maxBuffer: 120, // Maximum buffer size in seconds
      playBuffer: 3, // Buffer size to start playback
      waitForBuffer: true, // Whether to wait for buffer before playback starts
    });

    await TrackPlayer.updateOptions({
      // Media controls capabilities
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
        Capability.SeekTo,
      ],
      // Control Notifications
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      // Icons for the notification
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      // Initial settings
      android: {
        appKilled: {
          keepNotification: true,
        },
      },
    });

    // Set default repeat mode
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);

    console.log('Track player setup complete');
  } catch (error) {
    console.error('Failed to setup the player:', error);
  }
};

export const useInitPlayer = () => {
  useEffect(() => {
    setupPlayer().catch(error => {
      console.error('Error in useInitPlayer effect:', error);
    });

    return () => {
      // Use proper cleanup instead of destroy
      TrackPlayer.pause()
        .then(() => {
          TrackPlayer.reset();
        })
        .catch(error => {
          console.error('Error resetting player:', error);
        });
    };
  }, []);
};
