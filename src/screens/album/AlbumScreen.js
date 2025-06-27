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
import MiniPlayer from '../playerTab/MiniPlayer';
import { useMusic } from '../../context/MusicContext';

// Mock data
const MOCK_SONGS = [
  { id: '1', title: 'Track 1', duration: '3:45' },
  { id: '2', title: 'Track 2', duration: '3:20' },
  { id: '3', title: 'Track 3', duration: '4:12' },
  { id: '4', title: 'Track 4', duration: '3:56' },
  { id: '5', title: 'Track 5', duration: '3:02' },
  { id: '6', title: 'Track 6', duration: '4:30' },
  { id: '7', title: 'Track 7', duration: '3:18' },
];

const AlbumScreen = () => {
  const navigation = useNavigation();
  const { currentTrack } = useMusic();
  
  const renderTrackItem = ({ item, index }) => (
    <TouchableOpacity style={styles.trackItem}>
      <Text style={styles.trackNumber}>{index + 1}</Text>
      <View style={styles.trackDetails}>
        <Text style={styles.trackTitle}>{item.title}</Text>
      </View>
      <Text style={styles.trackDuration}>{item.duration}</Text>
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
            <Icon name="heart-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Album info */}
        <View style={styles.albumInfoContainer}>
          <View style={styles.albumCoverContainer}>
            <View style={styles.albumCover} />
          </View>
          <Text style={styles.albumTitle}>Album Title</Text>
          <Text style={styles.albumArtist}>Artist Name</Text>
          <Text style={styles.albumInfo}>2022 • 10 songs • 45 min</Text>
          
          {/* Action buttons */}
          <View style={styles.albumActions}>
            <TouchableOpacity style={styles.shuffleButton}>
              <Icon name="shuffle" size={20} color="#000000" />
              <Text style={styles.shuffleButtonText}>SHUFFLE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton}>
              <Icon name="play" size={20} color="#FFFFFF" />
              <Text style={styles.playButtonText}>PLAY</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tracks list */}
        <View style={styles.tracksContainer}>
          {MOCK_SONGS.map((song, index) => renderTrackItem({ item: song, index }))}
        </View>
        
        {/* Album info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Release Date</Text>
          <Text style={styles.infoValue}>January 1, 2022</Text>
          
          <Text style={styles.infoLabel}>Genre</Text>
          <Text style={styles.infoValue}>Pop, Rock</Text>
          
          <Text style={styles.infoLabel}>Label</Text>
          <Text style={styles.infoValue}>Record Label</Text>
        </View>
        
        {/* More from artist */}
        <View style={styles.moreFromContainer}>
          <Text style={styles.sectionTitle}>More from Artist Name</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item) => (
              <TouchableOpacity key={item} style={styles.relatedAlbumItem}>
                <View style={styles.relatedAlbumCover} />
                <Text style={styles.relatedAlbumTitle}>Related Album {item}</Text>
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
  albumInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  albumCoverContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  albumCover: {
    width: 200,
    height: 200,
    backgroundColor: '#333',
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  albumArtist: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
  },
  albumInfo: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 24,
  },
  albumActions: {
    flexDirection: 'row',
    marginBottom: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tracksContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trackNumber: {
    width: 30,
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
  trackDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  trackTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  trackDuration: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 12,
  },
  moreButton: {
    padding: 8,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  infoLabel: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  moreFromContainer: {
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
  relatedAlbumItem: {
    width: 140,
    marginRight: 16,
  },
  relatedAlbumCover: {
    width: 140,
    height: 140,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  relatedAlbumTitle: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  bottomPadding: {
    height: 80,
  },
});

export default AlbumScreen;
