import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiService from '../../services/ApiService';
import SpotifyService from '../../services/SpotifyService';
import { debounce } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import { useMusic } from '../../context/MusicContext';
import { getAllSpotifyTracks } from '../../services/spotifytrack';
import { getArtistTopTracks } from '../../services/artistsearch';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

// Category types for the tab filter
const CATEGORIES = {
  ALL: 'Top',
  SONGS: 'Songs',
  ALBUMS: 'Albums',
  ARTISTS: 'Artists',
  PLAYLISTS: 'Playlists',
  PODCASTS: 'Podcasts',
};

// Result item components
const SongItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.songItem} onPress={() => onPress(item)}>
    <Image 
      source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
      style={styles.itemImage} 
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {item.primary_artists || item.artists || 'Unknown Artist'}
      </Text>
    </View>
    <TouchableOpacity style={styles.moreButton}>
      <Icon name="ellipsis-vertical" size={20} color="#888888" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const AlbumItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <Image 
      source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
      style={styles.itemImage} 
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {item.year ? `${item.year} • ` : ''}{item.primary_artists || item.artists || ''}
      </Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#888888" />
  </TouchableOpacity>
);

const ArtistItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <Image 
      source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
      style={styles.roundItemImage} 
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>Artist</Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#888888" />
  </TouchableOpacity>
);

const PlaylistItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <Image 
      source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
      style={styles.itemImage} 
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.name}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {item.spotify_playlist ? `Spotify • ${item.owner || 'Playlist'}` : 'Playlist'}
      </Text>
    </View>
    <View style={styles.playlistActions}>
      {item.spotify_playlist && (
        <View style={styles.spotifyBadge}>
          <Text style={styles.spotifyText}>SPOTIFY</Text>
        </View>
      )}
      <Icon name="chevron-forward" size={20} color="#888888" />
    </View>
  </TouchableOpacity>
);

const PodcastItem = ({ item, onPress }) => (
  <TouchableOpacity style={styles.resultItem} onPress={() => onPress(item)}>
    <Image 
      source={{ uri: item.image || 'https://via.placeholder.com/60' }} 
      style={styles.itemImage} 
    />
    <View style={styles.itemInfo}>
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title || item.name}</Text>
      <Text style={styles.itemSubtitle} numberOfLines={1}>
        {item.artists || item.creator || ''}
      </Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#888888" />
  </TouchableOpacity>
);

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [error, setError] = useState(null);
  const [abortController, setAbortController] = useState(null);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES.ALL);
  const navigation = useNavigation();
  const { playTrack } = useMusic();

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.trim() === '') {
        setResults(null);
        setFilteredResults(null);
        setIsLoading(false);
        return;
      }

      try {
        // Create a new AbortController for this request
        const controller = new AbortController();
        setAbortController(controller);

        // Search both JioSaavn and Spotify with higher limits
        const [jioSaavnResponse, spotifyPlaylists, spotifyArtistTracks] = await Promise.allSettled([
          apiService.search(searchQuery, 200, controller.signal), // Increased from 100 to 200
          SpotifyService.searchPlaylists(searchQuery, 100), // Increased from 50 to 100
          getArtistTopTracks(searchQuery) // Direct Spotify artist search
        ]);

        let combinedResults = {};

        // Handle JioSaavn results
        if (jioSaavnResponse.status === 'fulfilled' && jioSaavnResponse.value) {
          if (jioSaavnResponse.value.status === 'Success') {
            combinedResults = { ...jioSaavnResponse.value.data };
            console.log('Music fetched from JioSaavn');
          }
        }

        // Handle Spotify playlist results (from 1.js - working properly)
        if (spotifyPlaylists.status === 'fulfilled' && spotifyPlaylists.value.length > 0) {
          if (!combinedResults.playlists) {
            combinedResults.playlists = { data: [] };
          }
          // Format Spotify playlists exactly like in 1.js
          const formattedSpotifyPlaylists = spotifyPlaylists.value.map(playlist => ({
            ...playlist,
            source: 'spotify',
            spotify_playlist: true,
            spotify_id: playlist.id,
            title: playlist.name,
            name: playlist.name,
            owner: playlist.owner?.display_name || playlist.owner?.id || 'Spotify',
          }));
          // Add Spotify playlists to the beginning
          combinedResults.playlists.data = [
            ...formattedSpotifyPlaylists,
            ...(combinedResults.playlists.data || [])
          ];
          // Also add to top results if no top results exist
          if (!combinedResults.topQuery || !combinedResults.topQuery.data || combinedResults.topQuery.data.length === 0) {
            if (!combinedResults.topQuery) {
              combinedResults.topQuery = { data: [] };
            }
            // Add first few Spotify playlists as top results
            combinedResults.topQuery.data = [
              ...formattedSpotifyPlaylists.slice(0, 3),
              ...(combinedResults.topQuery.data || [])
            ];
          }
        } else if (spotifyPlaylists.status === 'rejected') {
          // Try direct call as fallback
          try {
            const directSpotifyPlaylists = await SpotifyService.searchPlaylists(searchQuery, 20);
            if (directSpotifyPlaylists && directSpotifyPlaylists.length > 0) {
              if (!combinedResults.playlists) {
                combinedResults.playlists = { data: [] };
              }
              // Add direct Spotify playlists to the beginning
              combinedResults.playlists.data = [
                ...directSpotifyPlaylists,
                ...(combinedResults.playlists.data || [])
              ];
            }
          } catch (fallbackError) {}
        } else {
          // Try direct call as fallback
          try {
            const directSpotifyPlaylists = await SpotifyService.searchPlaylists(searchQuery, 20);
            if (directSpotifyPlaylists && directSpotifyPlaylists.length > 0) {
              if (!combinedResults.playlists) {
                combinedResults.playlists = { data: [] };
              }
              // Add direct Spotify playlists to the beginning
              combinedResults.playlists.data = [
                ...directSpotifyPlaylists,
                ...(combinedResults.playlists.data || [])
              ];
            }
          } catch (fallbackError) {}
        }

        // Handle Spotify artist tracks (from 2.js - complete song data)
        if (spotifyArtistTracks.status === 'fulfilled' && spotifyArtistTracks.value && spotifyArtistTracks.value.length > 0) {
          // Format for Songs section
          if (!combinedResults.songs) {
            combinedResults.songs = { data: [] };
          }
          
          const formattedSpotifyTracks = spotifyArtistTracks.value.map((track, index) => ({
            id: `spotify_${track.id}_${index}`,
            name: track.name,
            subtitle: track.artists,
            primary_artists: track.artists,
            image: track.image || '',
            source: 'spotify',
            spotify_id: track.id,
            duration: track.duration,
            album: track.album,
          }));
          
          // Add Spotify tracks to the beginning of songs
          combinedResults.songs.data = [
            ...formattedSpotifyTracks,
            ...(combinedResults.songs.data || [])
          ];
          
          // Also add to top results if no top results exist
          if (!combinedResults.topQuery || !combinedResults.topQuery.data || combinedResults.topQuery.data.length === 0) {
            if (!combinedResults.topQuery) {
              combinedResults.topQuery = { data: [] };
            }
            // Add first few Spotify tracks as top results
            combinedResults.topQuery.data = [
              ...formattedSpotifyTracks.slice(0, 3),
              ...(combinedResults.topQuery.data || [])
            ];
          }
        }

        // If the top result is an artist from JioSaavn, also fetch their Spotify tracks
        let artistName = null;
        if (combinedResults.artists && combinedResults.artists.data && combinedResults.artists.data.length > 0) {
          artistName = combinedResults.artists.data[0].name;
        }
        if (artistName && artistName.toLowerCase() !== searchQuery.toLowerCase()) {
          // Only fetch if it's a different artist than what we already searched
          const additionalSpotifyTracks = await getArtistTopTracks(artistName);
          if (additionalSpotifyTracks && additionalSpotifyTracks.length > 0) {
            // Format for Songs section
            if (!combinedResults.songs) combinedResults.songs = { data: [] };
            
            // Create a set of existing Spotify IDs to avoid duplicates
            const existingSpotifyIds = new Set(
              combinedResults.songs.data
                .filter(item => item.spotify_id)
                .map(item => item.spotify_id)
            );
            
            const additionalFormattedTracks = additionalSpotifyTracks
              .filter(track => !existingSpotifyIds.has(track.id)) // Remove duplicates
              .map((track, index) => ({
                id: `spotify_${track.id}_additional_${index}`,
                name: track.name,
                subtitle: track.artists,
                primary_artists: track.artists,
                image: track.image || '',
                source: 'spotify',
                spotify_id: track.id,
                duration: track.duration,
                album: track.album,
              }));
            
            combinedResults.songs.data = [
              ...additionalFormattedTracks,
              ...(combinedResults.songs.data || [])
            ];
          }
        }

        if (Object.keys(combinedResults).length > 0) {
          setResults(combinedResults);
          applyFilter(combinedResults, activeCategory);
        } else {
          setError('No results found');
          setResults(null);
          setFilteredResults(null);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError(err.message || 'Something went wrong');
        setResults(null);
        setFilteredResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [activeCategory]
  );

  // Apply filter based on the active category
  const applyFilter = (data, category) => {
    if (!data) return;

    if (category === CATEGORIES.ALL) {
      setFilteredResults(data);
      return;
    }

    const filtered = { ...data };

    // Only keep the category that matches the active filter
    switch (category) {
      case CATEGORIES.SONGS:
        Object.keys(filtered).forEach(key => {
          if (key !== 'songs') {
            filtered[key] = { data: [] };
          }
        });
        break;
      case CATEGORIES.ALBUMS:
        Object.keys(filtered).forEach(key => {
          if (key !== 'albums') {
            filtered[key] = { data: [] };
          }
        });
        break;
      case CATEGORIES.ARTISTS:
        Object.keys(filtered).forEach(key => {
          if (key !== 'artists') {
            filtered[key] = { data: [] };
          }
        });
        break;
      case CATEGORIES.PLAYLISTS:
        Object.keys(filtered).forEach(key => {
          if (key !== 'playlists') {
            filtered[key] = { data: [] };
          }
        });
        break;
      case CATEGORIES.PODCASTS:
        Object.keys(filtered).forEach(key => {
          if (key !== 'shows') {
            filtered[key] = { data: [] };
          }
        });
        break;
      default:
        break;
    }

    setFilteredResults(filtered);
  };

  // Handle search query changes
  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true);
      setError(null);
      
      // Cancel previous request if it exists
      if (abortController) {
        abortController.abort();
      }
      
      debouncedSearch(query);
    } else {
      setResults(null);
      setFilteredResults(null);
    }
    
    // Cleanup function to cancel pending requests
    return () => {
      if (abortController) {
        abortController.abort();
      }
      debouncedSearch.cancel();
    };
  }, [query, debouncedSearch]);

  // Re-apply filter when active category changes
  useEffect(() => {
    if (results) {
      applyFilter(results, activeCategory);
    }
  }, [activeCategory]);

  // Handle pressing search button
  const handleSearch = () => {
    if (query.trim()) {
      setIsLoading(true);
      debouncedSearch.cancel();
      debouncedSearch(query);
    }
  };

  // Test function to debug Spotify playlist search
  const testSpotifyPlaylistSearch = async () => {
    try {
      console.log('🧪 Testing Spotify playlist search for "Arijit Singh"');
      const playlists = await SpotifyService.searchPlaylists('Arijit Singh', 10);
      console.log('🧪 Test result:', playlists);
      
      if (playlists && playlists.length > 0) {
        // Create a test result structure
        const testResults = {
          playlists: { data: playlists },
          topQuery: { data: playlists.slice(0, 3) }
        };
        
        console.log('🧪 Test results structure:', testResults);
        setResults(testResults);
        applyFilter(testResults, activeCategory);
      } else {
        console.log('🧪 No playlists found in test');
      }
    } catch (error) {
      console.error('🧪 Test failed:', error);
    }
  };

  // Handle item selection
  const handleSongPress = async (song) => {
    // If it's a Spotify song, search JioSaavn and play if found
    if (song.source === 'spotify') {
      try {
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
      } catch {
        alert('Unable to play this song');
      }
      return;
    }
    // Otherwise, use existing logic for JioSaavn songs
    try {
      const q = encodeURIComponent(`${song.name} ${song.primary_artists || song.subtitle || ''}`);
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
    } catch {
      alert('Unable to play this song');
    }
  };

  const handleAlbumPress = (album) => {
    navigation.navigate('AlbumScreen', { album });
  };

  const handleArtistPress = (artist) => {
    // You can implement artist screen navigation if needed
  };

  const handlePlaylistPress = (playlist) => {
    // If it's a Spotify playlist, navigate to SpotifyPlaylistScreen
    if (playlist.spotify_playlist && playlist.spotify_id) {
      navigation.navigate('SpotifyPlaylistScreen', {
        playlistId: playlist.spotify_id,
        playlistName: playlist.title || playlist.name,
        playlistImage: playlist.image,
      });
    } else {
      // fallback for other playlists
      navigation.navigate('PlaylistScreen', { playlist });
    }
  };

  const handlePodcastPress = (podcast) => {
    // You can implement podcast screen navigation if needed
  };

  // Handle category selection
  const handleCategoryPress = (category) => {
    setActiveCategory(category);
  };

  // Clear searcha
  const handleClearSearch = () => {
    setQuery('');
    setResults(null);
    setFilteredResults(null);
  };

  // Render search results
  const renderSearchResults = () => {
    if (!filteredResults || isLoading) return null;

    const sections = [];
    
    // Top results section
    if (filteredResults.topQuery?.data?.length > 0) {
      sections.push(
        <View key="top" style={styles.section}>
          <Text style={styles.sectionTitle}>Top Results</Text>
          <FlatList
            data={filteredResults.topQuery.data}
            renderItem={({ item }) => {
              // Determine item type and render appropriate component
              if (item.spotify_playlist || item.type === 'playlist') {
                return <PlaylistItem item={item} onPress={handlePlaylistPress} />;
              } else if (item.type === 'artist') {
                return <ArtistItem item={item} onPress={handleArtistPress} />;
              } else if (item.type === 'album') {
                return <AlbumItem item={item} onPress={handleAlbumPress} />;
              } else if (item.type === 'podcast' || item.type === 'show') {
                return <PodcastItem item={item} onPress={handlePodcastPress} />;
              } else {
                // Default to song
                return <SongItem item={item} onPress={handleSongPress} />;
              }
            }}
            keyExtractor={(item) => `top-${item.id || item.title || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // Artists section
    if (filteredResults.artists?.data?.length > 0) {
      sections.push(
        <View key="artists" style={styles.section}>
          <Text style={styles.sectionTitle}>Artists</Text>
          <FlatList
            data={filteredResults.artists.data}
            renderItem={({ item }) => <ArtistItem item={item} onPress={handleArtistPress} />}
            keyExtractor={(item) => `artist-${item.id || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // Albums section
    if (filteredResults.albums?.data?.length > 0) {
      sections.push(
        <View key="albums" style={styles.section}>
          <Text style={styles.sectionTitle}>Albums</Text>
          <FlatList
            data={filteredResults.albums.data}
            renderItem={({ item }) => <AlbumItem item={item} onPress={handleAlbumPress} />}
            keyExtractor={(item) => `album-${item.id || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // Songs section
    if (filteredResults.songs?.data?.length > 0) {
      sections.push(
        <View key="songs" style={styles.section}>
          <Text style={styles.sectionTitle}>Songs</Text>
          <FlatList
            data={filteredResults.songs.data}
            renderItem={({ item }) => <SongItem item={item} onPress={handleSongPress} />}
            keyExtractor={(item) => `song-${item.id || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // Playlists section
    if (filteredResults.playlists?.data?.length > 0) {
      sections.push(
        <View key="playlists" style={styles.section}>
          <Text style={styles.sectionTitle}>Playlists</Text>
          <FlatList
            data={filteredResults.playlists.data}
            renderItem={({ item }) => <PlaylistItem item={item} onPress={handlePlaylistPress} />}
            keyExtractor={(item) => `playlist-${item.id || item.title || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    } else {
      console.log('❌ No playlists to render');
      console.log('🔍 Playlists data structure:', filteredResults.playlists);
    }

    // Podcasts/Shows section
    if (filteredResults.shows?.data?.length > 0) {
      sections.push(
        <View key="podcasts" style={styles.section}>
          <Text style={styles.sectionTitle}>Podcasts</Text>
          <FlatList
            data={filteredResults.shows.data}
            renderItem={({ item }) => <PodcastItem item={item} onPress={handlePodcastPress} />}
            keyExtractor={(item) => `podcast-${item.id || item.title || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // If no results in any section
    if (sections.length === 0) {
      return (
        <View style={styles.messageContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff0000" />
          <Text style={styles.errorText}>No results found for "{query}"</Text>
        </View>
      );
    }

    return sections;
  };

  // Render category tabs
  const renderCategoryTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContentContainer}
        >
          {Object.values(CATEGORIES).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.tabButton,
                activeCategory === category && styles.activeTabButton,
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <Text 
                style={[
                  styles.tabButtonText,
                  activeCategory === category && styles.activeTabButtonText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.safeArea}>
        {/* Search header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <View style={styles.searchInputContainer}>
              <Icon name="search" size={20} color="#777777" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#777777"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                autoCapitalize="none"
                onSubmitEditing={handleSearch}
              />
            </View>
            {query.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}>
                <Icon name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category tabs - only show when there are results or query */}
        {(results || query) && renderCategoryTabs()}

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}>
          
          {/* Loading state */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <View style={styles.messageContainer}>
              <Icon name="alert-circle-outline" size={50} color="#ff0000" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Empty state (initial) */}
          {!query && !isLoading && !results && (
            <View style={styles.welcomeContainer}>
              <Icon name="search" size={60} color="#444444" style={styles.welcomeIcon} />
              <Text style={styles.welcomeText}>Search</Text>
              <Text style={styles.subText}>Find your favorite songs, artists, albums and playlists</Text>
            </View>
          )}

          {/* Empty results */}
          {query && !isLoading && !filteredResults && !error && (
            <View style={styles.messageContainer}>
              <Icon name="alert-circle-outline" size={50} color="#444444" />
              <Text style={styles.noResultsText}>No results found for "{query}"</Text>
            </View>
          )}

          {/* Search Results */}
          {renderSearchResults()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    height: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 25,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: 40,
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: '#111111',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tabsContentContainer: {
    paddingHorizontal: 0,
  },
  tabButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 20,
    backgroundColor: '#1E1E1E',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  activeTabButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#111111',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: '#111111',
  },
  welcomeIcon: {
    marginBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    backgroundColor: '#111111',
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
  },
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
    backgroundColor: '#111111',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  noResultsText: {
    color: '#ff0000',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: '#111111',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
    backgroundColor: '#111111',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
    backgroundColor: '#111111',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 14,
  },
  roundItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 3,
    fontWeight: '500',
  },
  itemSubtitle: {
    color: '#888',
    fontSize: 13,
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotifyBadge: {
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#1DB954',
  },
  spotifyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreButton: {
    padding: 6,
  },
  testButton: {
    backgroundColor: '#1DB954',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen; 