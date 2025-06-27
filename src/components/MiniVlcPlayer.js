import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { VLCPlayer } from 'react-native-vlc-media-player';

const { width } = Dimensions.get('window');

const MiniVlcPlayer = ({ url, title, artist, artwork, onClose }) => {
  const [paused, setPaused] = useState(false);

  return (
    <View style={styles.container}>
      {artwork && <Image source={{ uri: artwork }} style={styles.artwork} />}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{artist}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setPaused(!paused)}
      >
        <Text style={styles.buttonText}>{paused ? '▶️' : '⏸️'}</Text>
      </TouchableOpacity>
      {onClose && (
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
        </TouchableOpacity>
      )}
      <VLCPlayer
        source={{ uri: url }}
        audioOnly={true}
        playInBackground={true}
        paused={paused}
        onError={e => console.error('VLC error', e)}
        style={styles.hidden}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    elevation: 2,
  },
  artwork: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  artist: {
    color: '#bbb',
    fontSize: 13,
  },
  button: {
    padding: 8,
    backgroundColor: '#1DB954',
    borderRadius: 20,
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  close: {
    padding: 6,
    marginLeft: 2,
  },
  hidden: {
    width: 0,
    height: 0,
  },
});

export default MiniVlcPlayer; 