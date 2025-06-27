import React, { createContext, useState, useContext } from 'react';
import TrackPlayer from 'react-native-track-player';

export const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const pauseTrack = () => {
    setIsPlaying(false);
  };

  const stopTrack = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const addToPlaylist = (track) => {
    setPlaylist(prev => [...prev, track]);
  };

  const removeFromPlaylist = (trackId) => {
    setPlaylist(prev => prev.filter(track => track.id !== trackId));
  };

  const playSong = async (track) => {
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add([track]);
      await TrackPlayer.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      alert('Playback error: ' + error.message);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playlist,
        playTrack,
        pauseTrack,
        stopTrack,
        addToPlaylist,
        removeFromPlaylist,
        playSong,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
