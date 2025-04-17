import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';

const {width} = Dimensions.get('window');

const PlayerScreen = () => {
  const navigation = useNavigation();

  // Mock data
  const mockSong = {
    title: 'Song Title',
    artist: 'Artist Name',
  };

  // Handlers (now just stubs)
  const handleClose = () => {
    navigation.goBack();
  };

  const togglePlayPause = () => {
    // This would toggle play/pause
  };

  const skipForward = () => {
    // This would skip to next song
  };

  const skipBackward = () => {
    // This would skip to previous song
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Icon name="chevron-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Now Playing</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Album art */}
      <View style={styles.albumArtContainer}>
        <View style={styles.albumArt} />
      </View>
      
      {/* Song info */}
      <View style={styles.songInfoContainer}>
        <Text style={styles.songTitle}>{mockSong.title}</Text>
        <Text style={styles.artistName}>{mockSong.artist}</Text>
      </View>
      
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={100}
          value={50}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#555555"
          thumbTintColor="#FFFFFF"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>1:45</Text>
          <Text style={styles.timeText}>3:30</Text>
        </View>
      </View>
      
      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.secondaryControlButton}>
          <Icon name="shuffle" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
          <Icon name="play-skip-back" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseButton}>
          <Icon name="pause" size={30} color="#000000" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
          <Icon name="play-skip-forward" size={30} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryControlButton}>
          <Icon name="repeat" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
      
      {/* Bottom options */}
      <View style={styles.bottomOptionsContainer}>
        <TouchableOpacity style={styles.bottomOptionButton}>
          <Icon name="heart-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomOptionButton}>
          <Icon name="add-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.bottomOptionButton}>
          <Icon name="share-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
  },
  albumArtContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  albumArt: {
    width: width - 80,
    height: width - 80,
    borderRadius: 12,
    backgroundColor: '#333',
  },
  songInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artistName: {
    color: '#AAAAAA',
    fontSize: 16,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  secondaryControlButton: {
    padding: 12,
  },
  controlButton: {
    padding: 12,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  bottomOptionButton: {
    padding: 12,
  },
});

export default PlayerScreen;
