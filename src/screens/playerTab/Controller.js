import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, {usePlaybackState, State} from 'react-native-track-player';

const Controller = ({onNext, onPrevious, theme = 'dark'}) => {
  const playbackState = usePlaybackState();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setIsPlaying(playbackState === State.Playing);
  }, [playbackState]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
    setIsPlaying(!isPlaying);
  };

  const isDark = theme === 'dark';

  return (
    <View
      style={[
        styles.controlsContainer,
        isDark && styles.controlsContainerDark,
      ]}>
      <TouchableOpacity
        onPress={onPrevious}
        style={[
          styles.controlButton,
          isDark ? styles.darkButton : styles.lightButton,
        ]}>
        <Icon
          name="skip-previous"
          size={28}
          color={isDark ? '#E0C2FF' : '#4D20AF'}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handlePlayPause}
        style={[
          styles.playPauseButton,
          isDark ? styles.darkButton : styles.lightButton,
        ]}>
        <Icon
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={38}
          color="#fff"
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onNext}
        style={[
          styles.controlButton,
          isDark ? styles.darkButton : styles.lightButton,
        ]}>
        <Icon
          name="skip-next"
          size={28}
          color={isDark ? '#E0C2FF' : '#4D20AF'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: -4},
  },
  controlsContainerDark: {
    backgroundColor: '#0D0D0D',
    shadowColor: '#000',
  },
  controlButton: {
    padding: 16,
    borderRadius: 18,
    elevation: 4,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
  },
  playPauseButton: {
    padding: 20,
    borderRadius: 100,
    elevation: 6,
    shadowOpacity: 0.4,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 8,
  },
  darkButton: {
    backgroundColor: '#1E1E1E',
  },
  lightButton: {
    backgroundColor: '#F3F0FF',
  },
});

export default Controller;
