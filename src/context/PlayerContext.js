import React, { createContext, useState, useEffect, useContext } from 'react';
import TrackPlayer, { State as TrackPlayerState, Event } from 'react-native-track-player';

// Create the context
const PlayerContext = createContext(null);

// Create a provider component
export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackState, setPlaybackState] = useState(null);

  // Function to play a track
  const playTrack = async (track, trackList = []) => {
    try {
      // Reset the queue
      await TrackPlayer.reset();
      
      // Add the selected track and the rest of the tracks to the queue
      const tracksToAdd = [track, ...trackList.filter(t => t.id !== track.id)];
      await TrackPlayer.add(tracksToAdd);
      
      // Start playing
      await TrackPlayer.play();
      
      // Update state
      setCurrentTrack(track);
      setQueue(tracksToAdd);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  // Function to pause playback
  const pause = async () => {
    try {
      await TrackPlayer.pause();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error pausing playback:', error);
    }
  };

  // Function to resume playback
  const resume = async () => {
    try {
      await TrackPlayer.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error resuming playback:', error);
    }
  };

  // Function to skip to the next track
  const next = async () => {
    try {
      await TrackPlayer.skipToNext();
      const newIndex = await TrackPlayer.getCurrentTrack();
      const track = await TrackPlayer.getTrack(newIndex);
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  // Function to skip to the previous track
  const previous = async () => {
    try {
      await TrackPlayer.skipToPrevious();
      const newIndex = await TrackPlayer.getCurrentTrack();
      const track = await TrackPlayer.getTrack(newIndex);
      setCurrentTrack(track);
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  // Listen for playback state changes
  useEffect(() => {
    const listener = TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
      setPlaybackState(event.state);
      
      // Update isPlaying based on the playback state
      setIsPlaying(
        event.state === TrackPlayerState.Playing || 
        event.state === TrackPlayerState.Buffering
      );
    });

    // Clean up the listener when component unmounts
    return () => {
      listener.remove();
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        playbackState,
        playTrack,
        pause,
        resume,
        next,
        previous,
      }}>
      {children}
    </PlayerContext.Provider>
  );
};

// Custom hook for using the player context
export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error('usePlayerContext must be used within a PlayerProvider');
  }
  return context;
};

// Note: We no longer export a Main component from this file,
// as that was creating the circular dependency
