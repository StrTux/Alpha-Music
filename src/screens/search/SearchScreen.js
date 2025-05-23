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
import { debounce } from 'lodash';

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
      <Text style={styles.itemSubtitle} numberOfLines={1}>Playlist</Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#888888" />
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

        const response = await apiService.search(searchQuery, 20, controller.signal);
        
        if (response && response.status === 'Success') {
          setResults(response.data);
          applyFilter(response.data, activeCategory);
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

  // Handle item selection
  const handleSongPress = (song) => {
    console.log('Song selected:', song);
    // Add your navigation or playback logic here
  };

  const handleAlbumPress = (album) => {
    console.log('Album selected:', album);
    // Add your navigation logic here
  };

  const handleArtistPress = (artist) => {
    console.log('Artist selected:', artist);
    // Add your navigation logic here
  };

  const handlePlaylistPress = (playlist) => {
    console.log('Playlist selected:', playlist);
    // Add your navigation logic here
  };

  const handlePodcastPress = (podcast) => {
    console.log('Podcast selected:', podcast);
    // Add your navigation logic here
  };

  // Handle category selection
  const handleCategoryPress = (category) => {
    setActiveCategory(category);
  };

  // Clear search
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
            data={filteredResults.topQuery.data.slice(0, 5)}
            renderItem={({ item }) => {
              // Determine item type and render appropriate component
              if (item.type === 'artist') {
                return <ArtistItem item={item} onPress={handleArtistPress} />;
              } else if (item.type === 'album') {
                return <AlbumItem item={item} onPress={handleAlbumPress} />;
              } else if (item.type === 'playlist') {
                return <PlaylistItem item={item} onPress={handlePlaylistPress} />;
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
            data={filteredResults.artists.data.slice(0, 5)}
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
            data={filteredResults.albums.data.slice(0, 5)}
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
            data={filteredResults.songs.data.slice(0, 5)}
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
            data={filteredResults.playlists.data.slice(0, 5)}
            renderItem={({ item }) => <PlaylistItem item={item} onPress={handlePlaylistPress} />}
            keyExtractor={(item) => `playlist-${item.id || item.title || item.name || Math.random().toString()}`}
            scrollEnabled={false}
          />
        </View>
      );
    }

    // Podcasts/Shows section
    if (filteredResults.shows?.data?.length > 0) {
      sections.push(
        <View key="podcasts" style={styles.section}>
          <Text style={styles.sectionTitle}>Podcasts</Text>
          <FlatList
            data={filteredResults.shows.data.slice(0, 5)}
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
  moreButton: {
    padding: 6,
  },
});

export default SearchScreen;
