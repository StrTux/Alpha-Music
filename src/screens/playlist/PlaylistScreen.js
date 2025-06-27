import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import { useMusic } from '../../context/MusicContext';
import MiniPlayer from '../playerTab/MiniPlayer';

// Mock data
const MOCK_SONGS = [
  { id: '1', title: 'Song 1', artist: 'Artist 1', duration: '3:45' },
  { id: '2', title: 'Song 2', artist: 'Artist 2', duration: '3:20' },
  { id: '3', title: 'Song 3', artist: 'Artist 3', duration: '4:12' },
  { id: '4', title: 'Song 4', artist: 'Artist 4', duration: '3:56' },
  { id: '5', title: 'Song 5', artist: 'Artist 5', duration: '3:02' },
  { id: '6', title: 'Song 6', artist: 'Artist 6', duration: '4:30' },
  { id: '7', title: 'Song 7', artist: 'Artist 7', duration: '3:18' },
];

const PlaylistScreen = () => {
  const navigation = useNavigation();
  const { currentTrack } = useMusic();
  
  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity style={styles.songItem}>
      <Text style={styles.songNumber}>{index + 1}</Text>
      <View style={styles.songDetails}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songArtist}>{item.artist}</Text>
      </View>
      <Text style={styles.songDuration}>{item.duration}</Text>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Playlist info */}
        <View style={styles.playlistInfoContainer}>
          <View style={styles.playlistCoverContainer}>
            <View style={styles.playlistCover} />
          </View>
          <Text style={styles.playlistTitle}>Playlist Title</Text>
          <Text style={styles.playlistCreator}>Created by User</Text>
          <Text style={styles.playlistInfo}>15 songs • 1 hour 20 min</Text>
          
          {/* Action buttons */}
          <View style={styles.playlistActions}>
            <TouchableOpacity style={styles.downloadButton}>
              <Icon name="arrow-down" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffleButton}>
              <Icon name="shuffle" size={20} color="#000000" />
              <Text style={styles.shuffleButtonText}>SHUFFLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Icon name="play" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Songs list */}
        <View style={styles.songsContainer}>
          {MOCK_SONGS.map((song, index) => renderSongItem({ item: song, index }))}
        </View>
        
        {/* Recommended based on this playlist */}
        <View style={styles.recommendedContainer}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item) => (
              <TouchableOpacity key={item} style={styles.recommendedItem}>
                <View style={styles.recommendedCover} />
                <Text style={styles.recommendedTitle}>Recommended Song {item}</Text>
                <Text style={styles.recommendedArtist}>Artist Name</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Space for mini player */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Mini Player */}
      {currentTrack && <MiniPlayer />}
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
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  playlistInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  playlistCoverContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playlistCover: {
    width: 200,
    height: 200,
    backgroundColor: '#333',
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playlistCreator: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  playlistInfo: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 24,
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  downloadButton: {
    padding: 10,
    marginRight: 16,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    marginRight: 16,
  },
  shuffleButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  songNumber: {
    width: 30,
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
  songDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  songArtist: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  songDuration: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 12,
  },
  moreButton: {
    padding: 8,
  },
  recommendedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recommendedItem: {
    width: 140,
    marginRight: 16,
  },
  recommendedCover: {
    width: 140,
    height: 140,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  recommendedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
  },
  recommendedArtist: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  bottomPadding: {
    height: 80,
  },
});

export default PlaylistScreen;
