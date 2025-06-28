import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMusic } from '../context/MusicContext';
import MiniVlcPlayer from './MiniVlcPlayer';

const GlobalMiniPlayer = ({ isPlaylistOrAlbumScreen }) => {
  const { 
    currentTrack, 
    isPlaying, 
    showMiniPlayer, 
    nextTrack, 
    prevTrack, 
    hideMiniPlayer,
    togglePlayPause
  } = useMusic();

  if (!showMiniPlayer || !currentTrack) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: isPlaylistOrAlbumScreen ? 0 : 50 }]}>
      <MiniVlcPlayer
        track={currentTrack}
        onNext={nextTrack}
        onPrev={prevTrack}
        onClose={hideMiniPlayer}
        isPlaying={isPlaying}
        onTogglePlayPause={togglePlayPause}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default GlobalMiniPlayer; 