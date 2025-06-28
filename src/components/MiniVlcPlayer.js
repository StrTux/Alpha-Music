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

const MiniVlcPlayer = ({ track, onNext, onPrev, onClose, isPlaying: contextIsPlaying, onTogglePlayPause }) => {
  const [paused, setPaused] = useState(!contextIsPlaying);
  const [liked, setLiked] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(null);
  const isDark = Appearance.getColorScheme() === 'dark';

  // Sync with context isPlaying state
  useEffect(() => {
    setPaused(!contextIsPlaying);
  }, [contextIsPlaying]);

  // Reset on track change
  useEffect(() => {
    setPaused(false);
    setDuration(0);
    setCurrentTime(0);
  }, [track?.url]);

  // Update time/duration
  const onProgress = e => {
    const dur = e?.duration > 0 ? e.duration : duration;
    const cur = e?.currentTime >= 0 ? e.currentTime : currentTime;
    if (dur !== duration) setDuration(dur);
    setCurrentTime(cur);
  };

  // Seek handler
  const handleSeek = value => {
    if (playerRef.current && duration) {
      const seekTime = value * duration;
      playerRef.current.seek(seekTime);
      setCurrentTime(seekTime);
    }
  };

  // Format seconds to mm:ss
  const formatTime = sec => {
    const s = isFinite(sec) && sec >= 0 ? Math.floor(sec) : 0;
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  if (!track) return null;

  const progress = duration ? currentTime / duration : 0;

  return (
    <View style={[styles.container, isDark ? styles.dark : styles.light]}>
      {/* Slider only */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={progress}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#1DB954"
        maximumTrackTintColor="#888"
        thumbTintColor="#1DB954"
        disabled={!duration}
      />

      {/* Track info + controls */}
      <View style={styles.row}>
        <Image source={{ uri: track.artwork }} style={styles.artwork} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        </View>
        <TouchableOpacity onPress={onPrev} style={styles.btn}>
          <Feather name="skip-back" size={18} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onTogglePlayPause} style={styles.btn}>
          <Feather name={paused ? 'play' : 'pause'} size={20} color="#1DB954" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNext} style={styles.btn}>
          <Feather name="skip-forward" size={18} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setLiked(!liked)} style={styles.btn}>
          <Feather name="heart" size={18} color={liked ? '#e74c3c' : '#aaa'} />
        </TouchableOpacity>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Feather name="x" size={18} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
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
  container: {
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    elevation: 2,
    alignSelf: 'center',
    backgroundColor: 'red', // or dynamic via isDark
    width: width - 14,
  },  
  dark: { backgroundColor: '#111' },
  light: { backgroundColor: '#fff' },
  slider: { width: '100%', height: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  artwork: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#444',
    marginRight: 10,
  },
  info: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: '#fff' },
  artist: { fontSize: 12, color: '#bbb' },
  btn: { padding: 6, marginLeft: 4 },
});

export default MiniVlcPlayer;
