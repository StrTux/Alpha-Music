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
  { id: '1', title: 'Song 1', plays: '1.2M plays' },
  { id: '2', title: 'Song 2', plays: '890K plays' },
  { id: '3', title: 'Song 3', plays: '750K plays' },
  { id: '4', title: 'Song 4', plays: '500K plays' },
  { id: '5', title: 'Song 5', plays: '350K plays' },
];

const MOCK_ALBUMS = [
  { id: '1', title: 'Album 1', year: '2022' },
  { id: '2', title: 'Album 2', year: '2020' },
  { id: '3', title: 'Album 3', year: '2018' },
];

const ArtistScreen = () => {
  const navigation = useNavigation();
  const { currentTrack } = useMusic();
  
  // Render functions
  const renderSongItem = ({ item }) => (
    <TouchableOpacity style={styles.songItem}>
      <View style={styles.songDetails}>
        <Text style={styles.songTitle}>{item.title}</Text>
        <Text style={styles.songInfo}>{item.plays}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  
  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={styles.albumItem}>
      <View style={styles.albumCover} />
      <Text style={styles.albumTitle}>{item.title}</Text>
      <Text style={styles.albumYear}>{item.year}</Text>
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
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Artist info */}
        <View style={styles.artistInfoContainer}>
          <View style={styles.artistImageContainer}>
            <View style={styles.artistImage} />
          </View>
          <Text style={styles.artistName}>Artist Name</Text>
          <Text style={styles.artistFollowers}>2.5M monthly listeners</Text>
          
          {/* Action buttons */}
          <View style={styles.artistActions}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>FOLLOW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffleButton}>
              <Icon name="shuffle" size={20} color="#000000" />
              <Text style={styles.shuffleButtonText}>SHUFFLE</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Popular songs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular</Text>
          {MOCK_SONGS.map(song => renderSongItem({ item: song }))}
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>
        
        {/* Albums */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <FlatList
            data={MOCK_ALBUMS}
            renderItem={renderAlbumItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumsList}
          />
        </View>
        
        {/* About */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, 
            velit vel ultricies lacinia, nisl nisl aliquam nisl, eget aliquam nisl 
            nunc vel nisl. Sed euismod, velit vel ultricies lacinia.
          </Text>
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
  artistInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  artistImageContainer: {
    marginBottom: 16,
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#333',
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artistFollowers: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 24,
  },
  artistActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginRight: 16,
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#1DB954',
  },
  shuffleButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionContainer: {
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
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  songInfo: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  moreButton: {
    padding: 8,
  },
  seeAllButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  seeAllText: {
    color: '#AAAAAA',
    fontSize: 14,
    fontWeight: 'bold',
  },
  albumsList: {
    paddingBottom: 8,
  },
  albumItem: {
    width: 150,
    marginRight: 16,
  },
  albumCover: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  albumTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  albumYear: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  aboutText: {
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 80,
  },
});

export default ArtistScreen;
