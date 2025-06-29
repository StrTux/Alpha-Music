import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation, useRoute } from '@react-navigation/native';
import { useMusic } from '../../context/MusicContext';
import { getArtistTopTracks, getCompleteArtistData } from '../../services/artistsearch';
import apiService from '../../services/ApiService';
import SpotifyService from '../../services/SpotifyService';

const ArtistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentTrack, playTrack } = useMusic();
  
  // Get artist data from navigation
  const { artist, artistName, artistImage, artistId } = route.params || {};
  
  const [artistSongs, setArtistSongs] = useState([]);
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [artistDetails, setArtistDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [artistPlaylists, setArtistPlaylists] = useState([]);

  // Fetch artist data
  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch complete artist data from Spotify
        const completeData = await getCompleteArtistData(artistName);
        
        if (completeData) {
          setArtistDetails(completeData.details);
          // Format Spotify tracks
          const formattedSpotifyTracks = completeData.topTracks.map((track, index) => ({
            id: `spotify_${track.id}_${index}`,
            name: track.name,
            subtitle: track.artists,
            primary_artists: track.artists,
            image: track.image || artistImage,
            source: 'spotify',
            spotify_id: track.id,
            duration: track.duration,
            album: track.album,
          }));
          
          setArtistSongs(formattedSpotifyTracks);
        }
        
        // Fetch playlists for the artist (Spotify)
        try {
          const playlists = await SpotifyService.searchPlaylists(artistName, 20);
          setArtistPlaylists(playlists);
        } catch (e) {
          setArtistPlaylists([]);
        }
        
        // Also search JioSaavn for the artist
        try {
          const jioResponse = await apiService.search(artistName, 50);
          if (jioResponse.status === 'Success' && jioResponse.data.songs) {
            const jioSongs = jioResponse.data.songs.data || [];
            
            // Filter songs to only include those by this artist
            const filteredJioSongs = jioSongs.filter(song => {
              if (song.primary_artists) {
                const artistLower = song.primary_artists.toLowerCase();
                const searchLower = artistName.toLowerCase();
                return artistLower.includes(searchLower) || searchLower.includes(artistLower);
              }
              return false;
            });
            
            // Combine Spotify and JioSaavn songs
            const combinedSongs = [
              ...formattedSpotifyTracks,
              ...filteredJioSongs.map(song => ({ ...song, source: 'jiosaavn' }))
            ];
            
            setArtistSongs(combinedSongs);
          }
        } catch (jioError) {
          console.log('JioSaavn search failed, using only Spotify data');
        }
        
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (artistName) {
      fetchArtistData();
    }
  }, [artistName, artistImage]);

  // Handle song play
  const handleSongPress = async (song) => {
    try {
      setLoadingItemId(song.id);
      
      if (song.source === 'jiosaavn') {
        // Play JioSaavn song directly
        const url = song.download_url.find(v => v.quality === '320kbps')?.link || song.download_url.pop().link;
        playTrack({
          id: song.id,
          url,
          title: song.name,
          artist: song.subtitle || song.artist,
          artwork: song.image,
          album: song.album,
          duration: song.duration,
        });
      } else if (song.source === 'spotify') {
        // Search JioSaavn for Spotify song
        const q = encodeURIComponent(`${song.name} ${song.subtitle || ''}`);
        const resp = await fetch(`https://strtux-main.vercel.app/search/songs?q=${q}`);
        const js = await resp.json();
        const found = js.data?.results?.[0];
        if (!found?.download_url?.length) throw new Error('Not found');
        const url = found.download_url.find(v => v.quality === '320kbps')?.link || found.download_url.pop().link;
        playTrack({
          id: found.id,
          url,
          title: found.name,
          artist: found.subtitle || found.artist,
          artwork: found.image,
          album: found.album,
          duration: found.duration,
        });
      }
    } catch (error) {
      console.error('Error playing song:', error);
      alert('Unable to play this song');
    } finally {
      setLoadingItemId(null);
    }
  };
  
  // Render functions
  const renderSongItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => handleSongPress(item)}
      disabled={loadingItemId === item.id}
    >
      <View style={styles.songDetails}>
        <Text style={styles.songTitle}>{item.name}</Text>
        <Text style={styles.songInfo}>
          {item.source === 'spotify' ? 'Spotify' : 'JioSaavn'} • {item.album || 'Unknown Album'}
        </Text>
      </View>
      <View style={styles.songActions}>
        {loadingItemId === item.id && (
          <ActivityIndicator size="small" color="#1DB954" />
        )}
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-vertical" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={styles.albumItem}>
      <Image 
        source={{ uri: item.images?.[0]?.url || artistImage }} 
        style={styles.albumCover}
        resizeMode="cover"
      />
      <Text style={styles.albumTitle}>{item.name}</Text>
      <Text style={styles.albumYear}>{item.release_date?.split('-')[0] || 'Unknown'}</Text>
    </TouchableOpacity>
  );

  const renderPlaylistCard = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistCard}
      onPress={() => navigation.navigate('SpotifyPlaylistScreen', {
        playlistId: item.spotify_id,
        playlistName: item.name,
        playlistImage: item.image,
      })}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.image }} style={styles.playlistImage} />
      <Text style={styles.playlistTitle} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.playlistOwner} numberOfLines={1}>{item.owner}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading artist data...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Image 
              source={{ uri: artistImage || artist?.image }} 
              style={styles.artistImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.artistName}>{artistName}</Text>
          <View style={styles.artistActions}>
            <TouchableOpacity style={styles.playButton}>
              <Icon name="play" size={20} color="#fff" />
              <Text style={styles.playButtonText}>PLAY</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shuffleButton}>
              <Icon name="shuffle" size={20} color="#000000" />
              <Text style={styles.shuffleButtonText}>SHUFFLE</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Playlists section (horizontal scroll) */}
        {artistPlaylists.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Playlists</Text>
            <FlatList
              data={artistPlaylists}
              renderItem={renderPlaylistCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playlistsList}
            />
          </View>
        )}
        
        {/* Popular songs */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Popular Songs ({artistSongs.length})</Text>
          {artistSongs.length > 0 ? (
            artistSongs.slice(0, 10).map((song, idx) => (
              <TouchableOpacity
                key={song.id}
                style={styles.songItem}
                onPress={() => handleSongPress(song)}
                disabled={loadingItemId === song.id}
                activeOpacity={0.7}
              >
                <Text style={styles.songNumber}>{idx + 1}</Text>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.name}</Text>
                  <Text style={styles.songArtist}>{song.primary_artists || song.subtitle}</Text>
                </View>
                <Text style={styles.songDuration}>
                  {song.duration ? `${Math.floor(song.duration/60000)}:${String(Math.floor((song.duration%60000)/1000)).padStart(2,'0')}` : '--:--'}
                </Text>
                <TouchableOpacity style={styles.moreButton}>
                  <Icon name="ellipsis-vertical" size={20} color="#fff" />
                </TouchableOpacity>
                {loadingItemId === song.id && <ActivityIndicator color="#1DB954" style={{ marginLeft: 10 }} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noDataText}>No songs found</Text>
          )}
          {artistSongs.length > 10 && (
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>SEE ALL {artistSongs.length} SONGS</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* About */}
        {artistDetails?.genres && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genresContainer}>
              {artistDetails.genres.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Space for mini player */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  artistActions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    marginRight: 16,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
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
    paddingVertical: 10,
    height: 65,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  songInfo: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  songActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  noDataText: {
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreTag: {
    padding: 4,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  playlistsList: {
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 8,
  },
  playlistCard: {
    width: 140,
    marginRight: 14,
    backgroundColor: '#181818',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    elevation: 2,
  },
  playlistImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#222',
  },
  playlistTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  playlistOwner: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
  },
  songNumber: {
    width: 30,
    color: '#aaa',
    textAlign: 'center',
  },
  songArtist: {
    color: '#aaa',
    fontSize: 11,
  },
  songDuration: {
    color: '#ccc',
    fontSize: 10,
    width: 50,
    textAlign: 'right',
  },
});

export default ArtistScreen;
