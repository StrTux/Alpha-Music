// Same imports
import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import TrackPlayer, {useProgress, RepeatMode} from 'react-native-track-player';
import {useMusic} from '../../context/MusicContext';

const PlayerControls = ({
  mini = false,
  onSeek,
  showSlider = true,
  theme = 'dark',
}) => {
  const {
    isPaused,
    repeatMode,
    togglePlayback,
    skipToNext,
    skipToPrevious,
    shuffleQueue,
    toggleRepeatMode,
  } = useMusic();

  const progress = useProgress();
  const [sliderValue, setSliderValue] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  const colors = {
    icon: theme === 'dark' ? '#fff' : '#000',
    iconActive: '#1DB954',
    trackTint: theme === 'dark' ? '#777' : '#ccc',
    thumbTint: '#1DB954',
    background: theme === 'dark' ? 'transparent' : 'transparent', // transparent for full player
  };

  useEffect(() => {
    // Only update slider if not currently seeking and if position has changed
    if (
      !isSeeking &&
      progress.position !== undefined &&
      // This check prevents unnecessary updates
      Math.abs(sliderValue - progress.position) > 0.5
    ) {
      setSliderValue(progress.position);
    }
  }, [progress.position, isSeeking, sliderValue]);

  const formatTime = seconds => {
    if (seconds === undefined || isNaN(seconds)) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSliderChange = value => setSliderValue(value);
  const handleSlidingStart = () => setIsSeeking(true);
  const handleSlidingComplete = async value => {
    setIsSeeking(false);
    if (onSeek) {
      onSeek(value);
    } else {
      await TrackPlayer.seekTo(value);
    }
  };

  if (mini) {
    return (
      <View style={styles.miniContainer}>
        <TouchableOpacity style={styles.miniButton} onPress={skipToPrevious}>
          <Icon name="play-skip-back" size={20} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.miniButton, styles.miniPlayButton]}
          onPress={togglePlayback}>
          <Icon name={isPaused ? 'play' : 'pause'} size={20} color={'#fff'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.miniButton} onPress={skipToNext}>
          <Icon name="play-skip-forward" size={20} color={colors.icon} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      {showSlider && (
        <View style={styles.sliderContainer}>
          <Text style={[styles.timeText, {color: colors.icon}]}>
            {formatTime(progress.position)}
          </Text>

          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={progress.duration || 1}
            value={sliderValue}
            minimumTrackTintColor={colors.iconActive}
            maximumTrackTintColor={colors.trackTint}
            thumbTintColor={colors.thumbTint}
            onValueChange={handleSliderChange}
            onSlidingStart={handleSlidingStart}
            onSlidingComplete={handleSlidingComplete}
          />

          <Text style={[styles.timeText, {color: colors.icon}]}>
            {formatTime(progress.duration)}
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={shuffleQueue} style={styles.iconButton}>
          <MaterialIcon
            name="shuffle"
            size={24}
            color={
              repeatMode === RepeatMode.Off ? colors.icon : colors.iconActive
            }
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToPrevious} style={styles.iconButton}>
          <Icon name="play-skip-back" size={28} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlayback}
          style={styles.playPauseButton}>
          <Icon name={isPaused ? 'play' : 'pause'} size={32} color={'#fff'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext} style={styles.iconButton}>
          <Icon name="play-skip-forward" size={28} color={colors.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeatMode} style={styles.iconButton}>
          <MaterialIcon
            name={repeatMode === RepeatMode.Track ? 'repeat-one' : 'repeat'}
            size={24}
            color={
              repeatMode === RepeatMode.Off ? colors.icon : colors.iconActive
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // Removed backgroundColor here, handled dynamically
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    width: 40,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
  },
  iconButton: {
    padding: 8,
  },
  playPauseButton: {
    backgroundColor: '#1DB954',
    padding: 14,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  miniContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  miniButton: {
    padding: 8,
    marginHorizontal: 12,
  },
  miniPlayButton: {
    backgroundColor: '#1DB954',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PlayerControls;
