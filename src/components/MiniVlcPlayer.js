import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Appearance,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';
import { VLCPlayer } from 'react-native-vlc-media-player';

const { width } = Dimensions.get('window');

const MiniVlcPlayer = ({
  track,
  onNext,
  onPrev,
  onClose,
  isPlaying: contextIsPlaying,
  onTogglePlayPause,
}) => {
  const [paused, setPaused] = useState(!contextIsPlaying);
  const [liked, setLiked] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(null);
  const isDark = Appearance.getColorScheme() === 'dark';

  useEffect(() => {
    setPaused(!contextIsPlaying);
  }, [contextIsPlaying]);

  useEffect(() => {
    setPaused(false);
    setDuration(0);
    setCurrentTime(0);
  }, [track?.url]);

  const onProgress = e => {
    const dur = e?.duration > 0 ? e.duration : duration;
    const cur = e?.currentTime >= 0 ? e.currentTime : currentTime;
    if (dur !== duration) setDuration(dur);
    setCurrentTime(cur);
  };

  const handleSeek = value => {
    if (playerRef.current && duration) {
      const seekTime = value * duration;
      playerRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  if (!track) return null;

  const progress = duration ? currentTime / duration : 0;

  return (
    <View style={styles.wrapper}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={progress}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#333"
        thumbTintColor="#1DB954"
        disabled={!duration}
      />

      <View style={styles.container}>
        <Image source={{ uri: track.artwork }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity onPress={onTogglePlayPause} style={styles.btn}>
            <Feather name={paused ? "play" : "pause"} size={20} color="#1DB954" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.btn}>
            <Feather name="heart" size={18} color={liked ? "#e74c3c" : "#aaa"} />
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Feather name="x" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <VLCPlayer
        ref={playerRef}
        source={{ uri: track.url }}
        audioOnly
        playInBackground
        paused={paused}
        onProgress={onProgress}
        style={{ width: 0, height: 0 }}
        onError={e => console.log('VLC Error', e)}
        onEnded={onNext}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    margin: 15,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    elevation: 4,
  },
  slider: {
    width: '100%',
    height: 22,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#222',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  artist: {
    color: '#bbb',
    fontSize: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    paddingHorizontal: 6,
  },
});

export default MiniVlcPlayer;