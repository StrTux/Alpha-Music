import TrackPlayer, {
  Event,
  State,
  RepeatMode,
  Capability,
} from 'react-native-track-player';

// Function to handle playback errors with proper recovery
const handlePlaybackError = async error => {
  console.warn('Playback error occurred:', error);

  try {
    // Check current playback state
    const state = await TrackPlayer.getState();

    // If player is in playing state but encountered an error, pause first
    if (state === State.Playing) {
      await TrackPlayer.pause();
    }

    // Get current track and queue
    const currentTrack = await TrackPlayer.getCurrentTrack();
    const queue = await TrackPlayer.getQueue();

    // If there are more tracks in the queue, try to skip to the next one
    if (currentTrack !== null && currentTrack < queue.length - 1) {
      console.log('Attempting to recover by skipping to next track');
      await TrackPlayer.skipToNext();
      await TrackPlayer.play();
    } else {
      console.log('No more tracks to play or recovery not possible');
    }
  } catch (recoveryError) {
    console.error('Error during playback error recovery:', recoveryError);
  }
};

// Main service function that's registered in index.js
module.exports = async function () {
  // Set up the player event listeners
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('Event: RemotePlay');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('Event: RemotePause');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log('Event: RemoteStop');
    TrackPlayer.destroy();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('Event: RemoteNext');
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('Event: RemotePrevious');
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async data => {
    console.log('Event: RemoteSeek', data);
    try {
      await TrackPlayer.seekTo(data.position);
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async data => {
    console.log('Event: RemoteJumpForward', data);
    try {
      const position = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(position + data.interval);
    } catch (error) {
      console.error('Error jumping forward:', error);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async data => {
    console.log('Event: RemoteJumpBackward', data);
    try {
      const position = await TrackPlayer.getPosition();
      await TrackPlayer.seekTo(Math.max(0, position - data.interval));
    } catch (error) {
      console.error('Error jumping backward:', error);
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async data => {
    console.log('Event: PlaybackTrackChanged', data);

    if (data.nextTrack === undefined || data.nextTrack === null) {
      // End of queue reached
      console.log('End of queue reached');

      // Get repeat mode
      const repeatMode = await TrackPlayer.getRepeatMode();

      if (repeatMode === RepeatMode.Queue) {
        console.log('Queue repeat mode active, restarting queue');
        try {
          // Reset to the first track and play
          await TrackPlayer.skip(0);
          await TrackPlayer.play();
        } catch (error) {
          console.error('Error restarting queue:', error);
        }
      }
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async data => {
    console.log('Event: PlaybackQueueEnded', data);

    // Get repeat mode
    const repeatMode = await TrackPlayer.getRepeatMode();

    if (repeatMode === RepeatMode.Queue) {
      console.log('Queue repeat mode active, restarting queue');
      try {
        // Reset to the first track and play
        await TrackPlayer.skip(0);
        await TrackPlayer.play();
      } catch (error) {
        console.error('Error restarting queue on queue end:', error);
      }
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackState, data => {
    console.log('Event: PlaybackState', data);
  });

  // Handle playback errors with proper recovery
  TrackPlayer.addEventListener(Event.PlaybackError, async error => {
    console.error('Playback error:', error);

    try {
      // Check if this is a Source error (common with unsupported formats or invalid URLs)
      const isSourceError =
        error &&
        ((error.code &&
          error.code.includes('android-parsing-container-unsupported')) ||
          (error.message && error.message.includes('Source error')));

      if (isSourceError) {
        console.warn('Source error detected, trying to recover');

        // First pause the current track
        await TrackPlayer.pause().catch(() => {});

        // Get the queue and current track info
        const queue = await TrackPlayer.getQueue().catch(() => []);
        const currentIndex = await TrackPlayer.getCurrentTrack().catch(
          () => -1,
        );

        if (currentIndex !== -1 && currentIndex < queue.length - 1) {
          console.log('Skipping to next track due to source error');
          await TrackPlayer.skipToNext().catch(() => {});
          await TrackPlayer.play().catch(() => {});
        } else {
          console.log('No more tracks to play after error');
        }
      } else {
        // For other types of errors, use the general handler
        await handlePlaybackError(error);
      }
    } catch (handlingError) {
      console.error('Error handling playback error:', handlingError);
    }
  });

  // This is fired when the user presses the rating button
  TrackPlayer.addEventListener(Event.RemoteSetRating, data => {
    console.log('Event: RemoteSetRating', data);
  });
};
