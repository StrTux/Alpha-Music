import React, { useRef, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { VLCPlayer } from 'react-native-vlc-media-player';

const VlcAudioPlayer = ({ url, title }) => {
  const playerRef = useRef(null);
  const [paused, setPaused] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <VLCPlayer
        ref={playerRef}
        source={{ uri: url }}
        audioOnly={true}
        playInBackground={true}
        autoplay={false}
        onError={(e) => console.error('VLC playback error:', e)}
        style={styles.hidden}
      />
      <Button
        title={paused ? '▶️ Play' : '⏸ Pause'}
        onPress={() => {
          setPaused(!paused);
          if (!paused) playerRef.current.pause();
          else playerRef.current.play();
        }}
      />
    </View>
  );
};

export default VlcAudioPlayer;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { marginBottom: 20, fontSize: 20 },
  hidden: { width: 0, height: 0 },
});
