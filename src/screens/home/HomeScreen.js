import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useContext } from 'react';
import { MusicContext } from '../../context/MusicContext';
import { useNavigation } from '@react-navigation/native';

import ErrorBoundary from '../../components/common/ErrorBoundary';
import { useMusic } from '../../context/MusicContext';
import VlcAudioPlayer from '../../components/VLCPlayerComponent';
import MiniVlcPlayer from '../../components/MiniVlcPlayer';

// API base URL
const BASE_URL = "https://strtux-main.vercel.app";
const SCREEN_WIDTH = Dimensions.get('window').width;

// Utility function to ensure high-quality images
const getHighQualityImage = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/500';

  // Some APIs might return different sized images
  // This ensures we're using the highest quality version possible
  // For JioSaavn, we ensure we're getting the 500x500 version

  // If the image URL contains a size specification, ensure it's 500x500
  if (imageUrl.includes('saavncdn.com')) {
    // Replace any existing size with 500x500
    return imageUrl.replace(/\d+x\d+/, '500x500');
  }

  return imageUrl;
};

// Custom Image component with loading and error handling
const HighQualityImage = ({ source, style, placeholderSource }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <View style={[style, styles.imageContainer]}>
      {isLoading && (
        <View style={[style, styles.imagePlaceholder]}>
          <ActivityIndicator size="small" color="#1DB954" />
        </View>
      )}

      <Image
        source={hasError ? placeholderSource : { uri: source }}
        style={[style, !isLoading && !hasError && { opacity: 1 }]}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        // Add caching for better performance
        loadingIndicatorSource={placeholderSource}
        progressiveRenderingEnabled={true}
      />
    </View>
  );
};

const LANGUAGES = [
  { id: '1', name: 'For you', code: 'all' },
  { id: '2', name: 'Hindi', code: 'hindi' },
  { id: '3', name: 'English', code: 'english' },
  { id: '4', name: 'Punjabi', code: 'punjabi' },
  { id: '5', name: 'Tamil', code: 'tamil' },
  { id: '6', name: 'Telugu', code: 'telugu' },
  { id: '7', name: 'Marathi', code: 'marathi' },
  { id: '8', name: 'Bengali', code: 'bengali' },
  { id: '9', name: 'Kannada', code: 'kannada' },
  { id: '10', name: 'Bhojpuri', code: 'bhojpuri' },
  { id: '11', name: 'Malayalam', code: 'malayalam' },
  { id: '12', name: 'Urdu', code: 'urdu' },
  { id: '13', name: 'Haryanvi', code: 'haryanvi' },
  { id: '14', name: 'Rajasthani', code: 'rajasthani' },
  { id: '15', name: 'Odia', code: 'odia' },
  { id: '16', name: 'Assamese', code: 'assamese' },
];

// Define playlists without images
const PLAYLISTS = [
  { id: '1', name: 'Liked Songs', gradient: '#8440FA' },
  { id: '2', name: 'Party', gradient: '#333333' },
  { id: '3', name: 'Recently Played', gradient: '#333333' },
  { id: '4', name: 'Saved Playlists', gradient: '#333333' },
];

const HomeScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('2'); // Default to Hindi
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loading, setLoading] = useState({
    trending: true,
    albums: true,
    playlists: true,
    artists: true,
  });
  const [loadingItemId, setLoadingItemId] = useState(null);

  // Get music context functions
  const { playTrack, currentTrack } = useMusic();
  const navigation = useNavigation();

  // Get current language code
  const getCurrentLanguageCode = () => {
    const lang = LANGUAGES.find(lang => lang.id === selectedLanguage);
    return lang ? lang.code : 'all';
  };

  // Fetch trending songs
  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        setLoading(prev => ({ ...prev, trending: true }));
        const response = await fetch(`${BASE_URL}/get/trending`);
        const data = await response.json();
        if (data.status === 'Success' && data.data) {
          setTrendingSongs(data.data.filter(item => item.type === 'song' || item.type === 'album'));
        }
      } catch (error) {
        console.error('Error fetching trending songs:', error);
      } finally {
        setLoading(prev => ({ ...prev, trending: false }));
      }
    };

    fetchTrendingSongs();
  }, []);

  // Fetch top albums based on selected language
  useEffect(() => {
    const fetchTopAlbums = async () => {
      try {
        setLoading(prev => ({ ...prev, albums: true }));
        const langCode = getCurrentLanguageCode();
        let url = `${BASE_URL}/search/albums?q=${langCode === 'all' ? 'top' : langCode}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === 'Success' && data.data && data.data.results) {
          setTopAlbums(data.data.results);
        }
      } catch (error) {
        console.error('Error fetching top albums:', error);
      } finally {
        setLoading(prev => ({ ...prev, albums: false }));
      }
    };

    fetchTopAlbums();
  }, [selectedLanguage]);

  // Fetch top playlists based on selected language
  useEffect(() => {
    const fetchTopPlaylists = async () => {
      try {
        setLoading(prev => ({ ...prev, playlists: true }));
        const langCode = getCurrentLanguageCode();
        let query = langCode === 'all' ? 'top playlists' : `${langCode} playlists`;
        const response = await fetch(`${BASE_URL}/search/playlists?q=${query}`);
        const data = await response.json();
        if (data.status === 'Success' && data.data && data.data.results) {
          setTopPlaylists(data.data.results);
        }
      } catch (error) {
        console.error('Error fetching top playlists:', error);
      } finally {
        setLoading(prev => ({ ...prev, playlists: false }));
      }
    };

    fetchTopPlaylists();
  }, [selectedLanguage]);

  // Fetch top artists (independent of language selection)
  useEffect(() => {
    const fetchTopArtists = async () => {
      try {
        setLoading(prev => ({ ...prev, artists: true }));
        const response = await fetch(`${BASE_URL}/top-artists`);
        const data = await response.json();
        if (data.status === 'Success' && data.data) {
          setTopArtists(data.data);
        }
      } catch (error) {
        console.error('Error fetching top artists:', error);
      } finally {
        setLoading(prev => ({ ...prev, artists: false }));
      }
    };

    fetchTopArtists();
  }, []);

  // Render language button
  const renderLanguageButton = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageButton,
        selectedLanguage === item.id && styles.selectedLanguageButton,
      ]}
      onPress={() => setSelectedLanguage(item.id)}
    >
      <Text
        style={[
          styles.languageText,
          selectedLanguage === item.id && styles.selectedLanguageText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [selectedLanguage]);

  // Render trending item
  const renderTrendingItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => handlePlayTrendingItem(item)}
      disabled={loadingItemId === item.id}
      activeOpacity={0.7}
    >
      <HighQualityImage
        source={getHighQualityImage(item.image)}
        style={styles.trendingImage}
        placeholderSource={require('../../assets/placeholder.png')}
      />
      <Text style={styles.trendingTitle} numberOfLines={1}>
        {item.name || item.title}
      </Text>
      <Text style={styles.trendingArtist} numberOfLines={1}>
        {item.subtitle || item.artist || ''}
      </Text>
      {loadingItemId === item.id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#1DB954" />
        </View>
      )}
    </TouchableOpacity>
  ), [handlePlayTrendingItem, loadingItemId]);

  // Render album item
  const renderAlbumItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => navigation.navigate('AlbumScreen', { album: item })}
      disabled={loadingItemId === item.id}
      activeOpacity={0.7}
    >
      <HighQualityImage
        source={getHighQualityImage(item.image)}
        style={styles.trendingImage}
        placeholderSource={require('../../assets/placeholder.png')}
      />
      <Text style={styles.trendingTitle} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.trendingArtist} numberOfLines={1}>
        {item.subtitle || item.primaryArtists || ''}
      </Text>
    </TouchableOpacity>
  ), [navigation, loadingItemId]);

  // Render playlist item
  const renderPlaylistItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.trendingItem}
      onPress={() => navigation.navigate('PlaylistScreen', { playlist: item })}
      disabled={loadingItemId === item.id}
      activeOpacity={0.7}
    >
      <HighQualityImage
        source={getHighQualityImage(item.image)}
        style={styles.trendingImage}
        placeholderSource={require('../../assets/placeholder.png')}
      />
      <Text style={styles.trendingTitle} numberOfLines={1}>
        {item.name || item.title}
      </Text>
      <Text style={styles.trendingArtist} numberOfLines={1}>
        {item.subtitle || item.follower_count ? `${item.follower_count} followers` : ''}
      </Text>
    </TouchableOpacity>
  ), [navigation, loadingItemId]);

  // Render artist item
  const renderArtistItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.artistItem} activeOpacity={0.7}>
      <HighQualityImage
        source={getHighQualityImage(item.image)}
        style={styles.artistImage}
        placeholderSource={require('../../assets/placeholder.png')}
      />
      <Text style={styles.artistName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  ), []);

  // Loading indicator component
  const LoadingIndicator = useCallback(() => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1DB954" />
    </View>
  ), []);

  const renderSectionHeader = useCallback((title) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  ), []);

  // Horizontal row component for category content
  const HorizontalRow = useCallback(({ title, data, renderItem, isLoading }) => {
    if (isLoading) {
      return (
        <View style={styles.section}>
          {renderSectionHeader(title)}
          <LoadingIndicator />
        </View>
      );
    }

    if (!data || data.length === 0) {
      return (
        <View style={styles.section}>
          {renderSectionHeader(title)}
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      );
    }

    // Use item.url as key for local_library, otherwise item.id
    const keyExtractor = title === 'Local Library'
      ? (item) => item.url
      : (item) => item.id;

    return (
      <View style={styles.section}>
        {renderSectionHeader(title)}
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          viewabilityConfig={{
            viewAreaCoveragePercentThreshold: 30,
            minimumViewTime: 300,
          }}
        />
      </View>
    );
  }, [renderSectionHeader, LoadingIndicator]);

  // Playlist Grid Component
  const PlaylistGrid = () => (
    <View style={styles.playlistGridContainer}>
      <FlatList
        data={PLAYLISTS}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playlistCard}
            activeOpacity={0.7}
          >
            <View style={[styles.playlistCardInner, { backgroundColor: item.gradient }]}>
              <Text style={styles.playlistCardText}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.playlistGridContent}
        scrollEnabled={false}
      />
    </View>
  );

  // Language Selector Component
  const LanguageSelector = () => (
    <View style={styles.languageContainer}>
      <FlatList
        data={LANGUAGES}
        renderItem={renderLanguageButton}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.languageScrollContent}
      />
    </View>
  );

  const handlePlayTrendingItem = async (item) => {
    try {
      // Set loading state for this specific item
      setLoadingItemId(item.id);
      console.log('handlePlayTrendingItem: item:', item);

      // Create a query using the music name and artist
      const musicName = item.name || item.title || '';
      const artistName = item.subtitle || item.artist || '';
      const query = encodeURIComponent(`${musicName} ${artistName}`);
      console.log('handlePlayTrendingItem: query:', query);

      // Fetch songs using the API
      const response = await fetch(`${BASE_URL}/search/songs?q=${query}`);
      const data = await response.json();
      console.log('handlePlayTrendingItem: API response:', data);

      if (data.status === 'Success' && data.data && data.data.results && data.data.results.length > 0) {
        // Get the first song from results
        const song = data.data.results[0];
        console.log('handlePlayTrendingItem: song:', song);

        // Extract the high quality download URL (320kbps)
        let downloadUrl = '';
        if (song.download_url && Array.isArray(song.download_url)) {
          // Find the 320kbps version
          const highQualityVersion = song.download_url.find(version => version.quality === '320kbps');
          if (highQualityVersion) {
            downloadUrl = highQualityVersion.link;
          } else if (song.download_url.length > 0) {
            // Fallback to the highest quality available
            downloadUrl = song.download_url[song.download_url.length - 1].link;
          }
        }
        console.log('handlePlayTrendingItem: downloadUrl:', downloadUrl);

        // Safety check for playable URL
        if (!downloadUrl || !downloadUrl.startsWith('http')) {
          console.error('Invalid or missing audio URL:', downloadUrl);
          alert('This song cannot be played due to invalid audio URL.');
          setLoadingItemId(null);
          return;
        }

        // Prepare the track for playing
        const track = {
          id: song.id,
          url: downloadUrl,
          title: song.name,
          artist: song.subtitle || song.artist_map?.primary_artists?.[0]?.name || '',
          artwork: getHighQualityImage(song.image),
          album: song.album,
          duration: song.duration
        };
        console.log('handlePlayTrendingItem: track:', track);

        // Play the track using the global music context
        playTrack(track);
        console.log('Track added to global player:', track);
      } else {
        console.error('No songs found for query:', query);
      }
    } catch (error) {
      console.error('Error playing trending item:', error);
    } finally {
      // Clear loading state
      setLoadingItemId(null);
    }
  };

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Alpha Music</Text>
          </View>

          <View style={styles.mainContent}>
            <LanguageSelector />
            <PlaylistGrid />

            <FlatList
              data={[
                { title: 'Trending Now', data: trendingSongs, renderItem: renderTrendingItem, isLoading: loading.trending },
                { title: 'Top Albums', data: topAlbums, renderItem: renderAlbumItem, isLoading: loading.albums },
                { title: 'Top Playlists', data: topPlaylists, renderItem: renderPlaylistItem, isLoading: loading.playlists },
                { title: 'Top Artists', data: topArtists, renderItem: renderArtistItem, isLoading: loading.artists },
              ]}
              renderItem={({ item }) => (
                <HorizontalRow
                  title={item.title}
                  data={item.data}
                  renderItem={item.renderItem}
                  isLoading={item.isLoading}
                />
              )}
              keyExtractor={(item) => item.title}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews={true}
            />
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
  },
  languageContainer: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
    paddingVertical: 2,
  },
  languageScrollContent: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  playlistGridContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  playlistGridContent: {
    paddingBottom: 10,
  },
  playlistCard: {
    flex: 1,
    height: 50,
    margin: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  playlistCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 4,
  },
  playlistCardText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 10,
    marginLeft: 15,
  },
  horizontalListContent: {
    paddingLeft: 15,
    paddingRight: 15,
  },
  trendingItem: {
    width: 150,
    marginRight: 12,
    marginBottom: 5,
  },
  trendingImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  trendingTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  trendingArtist: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  artistItem: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#333',
  },
  artistName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  languageButton: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedLanguageButton: {
    backgroundColor: '#1DB954',
  },
  languageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#000',
  },
  contentContainer: {
    paddingBottom: 80, // Extra padding for MiniPlayer
  },
  imageContainer: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default HomeScreen;
