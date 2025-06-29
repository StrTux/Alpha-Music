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
import SpotifyService from '../../services/SpotifyService';

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

        // Fetch tracks from the Spotify playlist
        const spotifyTrending = await SpotifyService.getPlaylistTracks('37i9dQZF1DXbVhgADFy3im');
        // Fetch JioSaavn trending songs
        const response = await fetch(`${BASE_URL}/get/trending`);
        const data = await response.json();
        let jioTrending = [];
        if (data.status === 'Success' && data.data) {
          jioTrending = data.data.filter(item => item.type === 'song' || item.type === 'album');
        }

        // For each Spotify track, search JioSaavn for a match
        const formattedSpotifyTrending = await Promise.all(
          spotifyTrending.map(async (track) => {
            try {
              const q = encodeURIComponent(`${track.name} ${track.artists}`);
              const resp = await fetch(`https://strtux-main.vercel.app/search/songs?q=${q}`);
              const js = await resp.json();
              const found = js.data?.results?.[0];
              if (found && found.download_url?.length) {
                // If found on JioSaavn, return JioSaavn info (with a Spotify reference)
                return {
                  ...found,
                  source: 'jiosaavn',
                  spotify_id: track.id,
                  spotify_name: track.name,
                  spotify_artists: track.artists,
                  spotify_image: track.image,
                };
              } else {
                // If not found, return Spotify info
                return {
                  id: `spotify_${track.id}`,
                  name: track.name,
                  subtitle: track.artists,
                  image: track.image,
                  source: 'spotify',
                  spotify_id: track.id,
                  duration: track.duration,
                };
              }
            } catch {
              // On error, fallback to Spotify info
              return {
                id: `spotify_${track.id}`,
                name: track.name,
                subtitle: track.artists,
                image: track.image,
                source: 'spotify',
                spotify_id: track.id,
                duration: track.duration,
              };
            }
          })
        );

        // Combine: Spotify playlist (with JioSaavn matches if found) + JioSaavn trending
        setTrendingSongs([
          ...formattedSpotifyTrending,
          ...jioTrending.map(item => ({ ...item, source: 'jiosaavn' })),
        ]);
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
        let jioQuery = langCode === 'all' ? 'top' : langCode;
        let spotifyTerms = [
          langCode === 'all' ? 'top album spotify' : `${langCode} top album spotify`,
          langCode === 'all' ? 'top album india spotify' : `${langCode} top album india spotify`
        ];

        // JioSaavn albums
        let url = `${BASE_URL}/search/albums?q=${jioQuery}`;
        const response = await fetch(url);
        const data = await response.json();
        let jioAlbums = [];
        if (data.status === 'Success' && data.data && data.data.results) {
          jioAlbums = data.data.results;
        }

        // Spotify albums (search as playlists, since Spotify API doesn't have a direct album search endpoint for public charts)
        let spotifyAlbums = [];
        for (const term of spotifyTerms) {
          const results = await SpotifyService.searchPlaylists(term, 50);
          spotifyAlbums = spotifyAlbums.concat(results.map(a => ({ ...a, source: 'spotify' })));
        }

        // Remove duplicates by id
        const seen = new Set();
        spotifyAlbums = spotifyAlbums.filter(a => {
          if (seen.has(a.id)) return false;
          seen.add(a.id);
          return true;
        });

        // Combine both, with a label for source
        const combined = [
          ...spotifyAlbums,
          ...jioAlbums.map(a => ({ ...a, source: 'jiosaavn' })),
        ];

        setTopAlbums(combined);
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

        // JioSaavn playlists (already language-aware)
        const response = await fetch(`${BASE_URL}/search/playlists?q=${query}`);
        const data = await response.json();
        let jioPlaylists = [];
        if (data.status === 'Success' && data.data && data.data.results) {
          jioPlaylists = data.data.results;
        }

        // Spotify playlists (now language-aware)
        let spotifyQuery = 'top playlist 100';
        if (langCode !== 'all') {
          spotifyQuery = `${langCode} top playlist 100`;
        }
        const spotifyPlaylists = await SpotifyService.searchPlaylists(spotifyQuery, 50);

        // Combine both, with a label for source
        const combined = [
          ...spotifyPlaylists.map(p => ({ ...p, source: 'spotify' })),
          ...jioPlaylists.map(p => ({ ...p, source: 'jiosaavn' })),
        ];

        setTopPlaylists(combined);
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
      onPress={() => {
        if (item.source === 'jiosaavn') {
          // Play JioSaavn song
          playTrack({
            id: item.id,
            url: item.download_url.find(v => v.quality === '320kbps')?.link || item.download_url.pop().link,
            title: item.name,
            artist: item.subtitle || item.artist,
            artwork: item.image,
            album: item.album,
            duration: item.duration,
          });
        } else {
          alert('This song is only available on Spotify. Please use Spotify app to play it.');
        }
      }}
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
        {item.subtitle}
      </Text>
      <Text style={{ color: item.source === 'spotify' ? '#1DB954' : '#fff', fontSize: 10, marginTop: 2 }}>
        {item.source === 'spotify' ? 'Spotify' : 'JioSaavn'}
      </Text>
      {loadingItemId === item.id && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#1DB954" />
        </View>
      )}
    </TouchableOpacity>
  ), [playTrack, loadingItemId]);

  // Render album item
  const renderAlbumItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => {
        if (item.source === 'spotify') {
          navigation.navigate('SpotifyPlaylistScreen', {
            playlistId: item.spotify_id,
            playlistName: item.title || item.name,
            playlistImage: item.image,
          });
        } else {
          navigation.navigate('AlbumScreen', { album: item });
        }
      }}
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
      <Text style={{ color: item.source === 'spotify' ? '#ffffffb8' : '#ffffffb8', fontSize: 10, marginTop: 2 }}>
        {item.source === 'spotify' ? 'Spotify' : 'JioSaavn'}
      </Text>
    </TouchableOpacity>
  ), [navigation, loadingItemId]);

  // Render playlist item
  const renderPlaylistItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.trendingItem}
      onPress={() => {
        if (item.source === 'spotify') {
          navigation.navigate('SpotifyPlaylistScreen', {
            playlistId: item.spotify_id,
            playlistName: item.title || item.name,
            playlistImage: item.image,
          });
        } else {
          navigation.navigate('PlaylistScreen', { playlist: item });
        }
      }}
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
      {/* <Text style={styles.trendingArtist} numberOfLines={1}>
        {item.subtitle || item.follower_count ? `${item.follower_count} followers` : ''}
      </Text> */}
      <Text style={{ color: item.source === 'spotify' ? '#ffffffb8' : '#ffffffb8', fontSize: 10, marginTop: -0 }}>
        {item.source === 'spotify' ? 'Spotify' : 'JioSaavn'}
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
      setLoadingItemId(item.id);

      // Search JioSaavn for the Spotify track
      const q = encodeURIComponent(`${item.name} ${item.subtitle}`);
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
    } finally {
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
