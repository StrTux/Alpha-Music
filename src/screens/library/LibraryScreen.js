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
import MiniPlayer from '../../components/player/MiniPlayer';

// Mock data
const MOCK_PLAYLISTS = [
  { id: '1', name: 'Liked Songs', count: '23 songs' },
  { id: '2', name: 'Recently Played', count: '15 songs' },
  { id: '3', name: 'My Playlist #1', count: '8 songs' },
  { id: '4', name: 'Road Trip', count: '12 songs' },
  { id: '5', name: 'Workout Mix', count: '10 songs' },
];

const LibraryScreen = () => {
  const renderPlaylistItem = ({item}) => (
    <TouchableOpacity style={styles.playlistItem}>
      <View style={styles.playlistImageContainer}>
        <View style={styles.playlistImage}>
          <Icon name="musical-notes" size={24} color="#FFF" />
        </View>
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistCount}>{item.count}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Library</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filter tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={[styles.filterTab, styles.activeFilterTab]}>
            <Text style={[styles.filterText, styles.activeFilterText]}>Playlists</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Artists</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Albums</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Downloads</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Playlist list */}
      <FlatList
        data={MOCK_PLAYLISTS}
        renderItem={renderPlaylistItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.playlistList}
      />
      
      {/* Mini Player */}
      <MiniPlayer />
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#333333',
  },
  activeFilterTab: {
    backgroundColor: '#1DB954',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  playlistList: {
    paddingBottom: 80,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playlistImageContainer: {
    marginRight: 16,
  },
  playlistImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  playlistCount: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
});

export default LibraryScreen;
