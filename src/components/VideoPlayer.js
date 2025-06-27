import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = ({ sourceUrl }) => {
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  return (
    <View style={styles.container}>
      {loading && (
        <ActivityIndicator size="large" color="#1DB954" style={StyleSheet.absoluteFill} />
      )}
      <Video
        ref={playerRef}
        source={{ uri: sourceUrl }}
        audioOnly={true} // Only play audio, even for mp4
        controls={true}
        paused={false}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={e => {
          setLoading(false);
          console.error('Video error:', e);
        }}
        style={styles.video}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', height: 60, backgroundColor: '#000' },
  video: { width: '100%', height: 60 },
});

export default VideoPlayer; 