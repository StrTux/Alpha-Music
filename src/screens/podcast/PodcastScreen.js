import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useMusic} from '../../context/MusicContext';
import MiniPlayer from '../../components/player/MiniPlayer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {useCachedData} from '../../contexts/CachedDataContext';

// API base URL - ensure this matches the one in HomeScreen
const BASE_URL = "https://strtux-main.vercel.app";
const {width} = Dimensions.get('window');

// Add default podcast image constant
const DEFAULT_PODCAST_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/004/844/942/small/podcast-icon-on-white-background-vector.jpg';

// Utility function to ensure high-quality images (reused from HomeScreen)
const getHighQualityImage = (imageUrl) => {
  if (!imageUrl) return DEFAULT_PODCAST_IMAGE;
  
  // For JioSaavn, ensure we're getting the 500x500 version
  if (imageUrl.includes('saavncdn.com')) {
    return imageUrl.replace(/\d+x\d+/, '500x500');
  }
  
  return imageUrl;
};

const PodcastScreen = () => {
  const [trendingPodcasts, setTrendingPodcasts] = useState([]);
  const [featuredPodcasts, setFeaturedPodcasts] = useState([]);
  const [newPodcasts, setNewPodcasts] = useState([]);
  const [popularHosts, setPopularHosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const {currentTrack} = useMusic();
  const abortControllerRef = useRef(null);
  const initialLoadDone = useRef(false);
  const navigation = useNavigation();
  const {fetchWithCache} = useCachedData();

  // Fetch categories from the API
  const fetchCategories = useCallback(async () => {
    try {
      // Instead of fetching categories from the API, use default categories
      // since the /podcast/categories endpoint is not available (404 error)
      const defaultCategories = getDefaultCategories();
      setCategories(defaultCategories);
      setIsLoading(false);
      
      // Log that we're using default categories
      console.log('Using default podcast categories instead of API fetch (API endpoint is unavailable)');
      
      /* Original API fetch code - disabled due to 404 error
      const response = await fetch(`${BASE_URL}/podcast/categories`);
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'Success' && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        console.warn('Invalid categories data format:', data);
        setCategories([]);
      }
      */
    } catch (error) {
      console.error('Error in categories handling:', error);
      // Use default categories as fallback
      setCategories(getDefaultCategories());
      setErrorMessage(null); // Remove error message to prevent UI disruption
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories data
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fade-in animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => {
      // Cleanup animation to prevent memory leaks
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  // Format podcast data to match our UI components
  const formatPodcastData = useCallback(podcastData => {
    if (!Array.isArray(podcastData)) {
      console.warn(
        'Expected array for podcast data but got:',
        typeof podcastData,
      );
      return [];
    }

    return podcastData.map(podcast => ({
      id: podcast.id || `podcast-${Math.random().toString(36).substr(2, 9)}`,
      title: podcast.title || podcast.name || 'Unknown Podcast',
      host: podcast.artist || podcast.subtitle || 'Unknown Host',
      artwork: getHighQualityImage(podcast.image) || DEFAULT_PODCAST_IMAGE,
      description: podcast.description || podcast.subtitle || 'No description available',
      episodeCount: podcast.episode_count || podcast.episodeCount || 0,
      category: podcast.category || podcast.type || 'Podcast',
      url: podcast.url || podcast.perma_url || '',
      type: podcast.type || 'podcast',
      release_date: podcast.release_date || null,
    }));
  }, []);

  // Fetch podcast data
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const fetchPodcastData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Fetch trending podcasts
        console.log('Fetching trending podcasts from:', `${BASE_URL}/podcast/trending`);
        const trendingResponse = await fetch(`${BASE_URL}/podcast/trending`, {
          signal: controller.signal
        });
        
        if (!trendingResponse.ok) {
          throw new Error(`Failed to fetch trending podcasts: ${trendingResponse.status}`);
        }
        
        const trendingData = await trendingResponse.json();
        console.log('Trending podcasts response:', JSON.stringify(trendingData).substring(0, 200) + '...');
        
        if (trendingData.status === 'Success' && Array.isArray(trendingData.data)) {
          setTrendingPodcasts(formatPodcastData(trendingData.data));
        } else {
          console.warn('Invalid trending podcasts data format:', trendingData);
          setTrendingPodcasts([]);
        }

        // Set featured podcasts (for now, just use first trending podcast if available)
        if (trendingData.data && trendingData.data.length > 0) {
          setFeaturedPodcasts(formatPodcastData([trendingData.data[0]]));
        }

        // Set a subset of trending podcasts as "new podcasts" for demo purposes
        if (trendingData.data && trendingData.data.length > 0) {
          // Use a different starting point to show different items
          const startIdx = Math.min(3, trendingData.data.length - 1);
          const endIdx = Math.min(startIdx + 5, trendingData.data.length);
          const newPodcastsData = trendingData.data.slice(startIdx, endIdx);
          setNewPodcasts(formatPodcastData(newPodcastsData));
        }

        // Set mock popular hosts for now
        setPopularHosts(getMockHosts());

      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching podcast data:', error);
          setErrorMessage('Failed to load podcast data. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          initialLoadDone.current = true;
        }
      }
    };

    fetchPodcastData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [formatPodcastData]);

  // Helper functions for categories
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Spirituality': 'flame-outline',
      'Stories': 'book-outline',
      'True Crime': 'skull-outline',
      'Education': 'school-outline',
      'Entertainment': 'film-outline',
      'News': 'newspaper-outline',
      'Business': 'briefcase-outline',
      'Health & Lifestyle': 'fitness-outline',
      'Sports': 'football-outline',
      'Technology': 'hardware-chip-outline',
    };
    return iconMap[categoryName] || 'radio-outline';
  };

  const getCategoryColor = (index) => {
    const colors = [
      '#1DB954', // Spotify green
      '#FF6B6B', // Coral
      '#4A90E2', // Blue
      '#F39C12', // Orange
      '#9B59B6', // Purple
      '#2ECC71', // Green
      '#E74C3C', // Red
      '#3498DB', // Light Blue
      '#F1C40F', // Yellow
      '#16A085', // Teal
    ];
    return colors[index % colors.length];
  };

  const getDefaultCategories = () => {
    return [
      { id: 'category-0', name: 'Spirituality', icon: 'flame-outline', color: '#1DB954' },
      { id: 'category-1', name: 'Stories', icon: 'book-outline', color: '#FF6B6B' },
      { id: 'category-2', name: 'True Crime', icon: 'skull-outline', color: '#4A90E2' },
      { id: 'category-3', name: 'Education', icon: 'school-outline', color: '#F39C12' },
      { id: 'category-4', name: 'Entertainment', icon: 'film-outline', color: '#9B59B6' },
      { id: 'category-5', name: 'News', icon: 'newspaper-outline', color: '#2ECC71' },
      { id: 'category-6', name: 'Business', icon: 'briefcase-outline', color: '#E74C3C' },
      { id: 'category-7', name: 'Health & Lifestyle', icon: 'fitness-outline', color: '#3498DB' },
      { id: 'category-8', name: 'Sports', icon: 'football-outline', color: '#F1C40F' },
      { id: 'category-9', name: 'Technology', icon: 'hardware-chip-outline', color: '#16A085' },
    ];
  };

  // Mock hosts data
  const getMockHosts = () => {
    return [];
  };

  // Improve handlePodcastPress to show alerts immediately
  const handlePodcastPress = useCallback(podcast => {
    Alert.alert(
      podcast.title,
      `Host: ${podcast.host}`,
      [
        {
          text: 'Listen Now',
          onPress: () => {
            console.log(`Starting podcast: ${podcast.title}`);
            // Add your podcast playing logic here
          },
        },
        {
          text: 'View Details',
          onPress: () => {
            console.log(`View details for: ${podcast.title}`);
            // Navigation to details screen could go here
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  }, []);

  // Handle category press
  const handleCategoryPress = useCallback(category => {
    console.log(`Navigating to category: ${category.name}`);
    
    // Navigate to the category screen with the selected category
    navigation.navigate('PodcastCategorieScreen', { 
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon || getCategoryIcon(category.name),
        color: category.color || getCategoryColor(categories.findIndex(c => c.name === category.name))
      } 
    });
  }, [navigation, categories]);

  // Handle host press
  const handleHostPress = useCallback(host => {
    Alert.alert(host.name, `${host.followers} followers`, [
      {
        text: 'View Podcasts',
        onPress: () => console.log(`View ${host.name}'s podcasts`),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  }, []);

  // Pull to refresh functionality
  const handleRefresh = useCallback(() => {
    // Reset the cache and fetch new data
    initialLoadDone.current = false;

    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    // This will trigger the useEffect to run again
    setTrendingPodcasts([]);
    setFeaturedPodcasts([]);
    setNewPodcasts([]);
    setIsLoading(true);
  }, []);

  // Render each trending podcast item - memoized to prevent unnecessary re-renders
  const renderPodcastItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          style={styles.podcastItem}
          onPress={() => handlePodcastPress(item)}>
          <Image
            source={{uri: item.artwork}}
            style={styles.podcastImage}
            defaultSource={{
              uri: DEFAULT_PODCAST_IMAGE,
            }}
            onError={e => {
              console.log('Failed to load image:', e.nativeEvent.error);
            }}
          />
          <Text style={styles.podcastTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.podcastHost} numberOfLines={1}>
            {item.host}
          </Text>
        </TouchableOpacity>
      );
    },
    [handlePodcastPress],
  );

  // Render each host item - memoized to prevent unnecessary re-renders
  const renderHostItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          style={styles.hostItem}
          onPress={() => handleHostPress(item)}>
          <Image
            source={{uri: item.image}}
            style={styles.hostImage}
            defaultSource={{
              uri: DEFAULT_PODCAST_IMAGE,
            }}
            onError={e => {
              console.log('Failed to load image:', e.nativeEvent.error);
            }}
          />
          <Text style={styles.hostName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.hostFollowers}>{item.followers} followers</Text>
        </TouchableOpacity>
      );
    },
    [handleHostPress],
  );

  // Render categories
  const renderCategories = () => {
    return categories.map(category => (
      <TouchableOpacity
        key={category.id}
        style={styles.categoryGridItem}
        onPress={() => handleCategoryPress(category)}>
        <Icon name={getCategoryIcon(category.name)} size={30} color={category.color} />
        <Text style={styles.categoryGridName}>{category.name}</Text>
      </TouchableOpacity>
    ));
  };

  // While the data is loading on first mount, show a loading screen
  if (isLoading && !trendingPodcasts.length && !featuredPodcasts.length) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>Loading Podcasts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Podcasts</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {errorMessage && (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={24} color="#ff6b6b" />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRefresh}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Featured Podcast Banner */}
          {featuredPodcasts.length > 0 && (
            <TouchableOpacity
              style={styles.featuredPodcastBanner}
              onPress={() => handlePodcastPress(featuredPodcasts[0])}>
              <Image
                source={{uri: featuredPodcasts[0].artwork}}
                style={styles.featuredPodcastImage}
                blurRadius={3}
                defaultSource={{
                  uri: DEFAULT_PODCAST_IMAGE,
                }}
              />
              <View style={styles.featuredPodcastOverlay}>
                <View style={styles.featuredPodcastBadge}>
                  <Text style={styles.featuredPodcastBadgeText}>FEATURED</Text>
                </View>
                <Text style={styles.featuredPodcastTitle}>
                  {featuredPodcasts[0].title}
                </Text>
                <Text style={styles.featuredPodcastHost}>
                  By {featuredPodcasts[0].host}
                </Text>
                <Text style={styles.featuredPodcastDescription}>
                  {featuredPodcasts[0].description}
                </Text>
                <View style={styles.featuredPodcastButton}>
                  <Icon name="play-circle" size={16} color="#fff" />
                  <Text style={styles.featuredPodcastButtonText}>
                    Listen Now
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Trending Podcasts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending Podcasts</Text>
            {isLoading ? (
              <View style={styles.loadingSectionContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
              </View>
            ) : trendingPodcasts.length > 0 ? (
              <FlatList
                data={trendingPodcasts}
                renderItem={renderPodcastItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyText}>
                  No trending podcasts available
                </Text>
              </View>
            )}
          </View>

          {/* New Podcasts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Releases</Text>
            {isLoading ? (
              <View style={styles.loadingSectionContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
              </View>
            ) : newPodcasts.length > 0 ? (
              <FlatList
                data={newPodcasts}
                renderItem={renderPodcastItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyText}>
                  No new podcasts available
                </Text>
              </View>
            )}
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id || `category-${category.name}`}
                  style={[
                    styles.categoryGridItem,
                    {backgroundColor: (category.color || getCategoryColor(index)) + '20'},
                  ]}
                  onPress={() => handleCategoryPress(category)}>
                  <Icon 
                    name={category.icon || getCategoryIcon(category.name)} 
                    size={30} 
                    color={category.color || getCategoryColor(index)} 
                  />
                  <Text style={styles.categoryGridName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Popular Hosts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Hosts</Text>
            {isLoading ? (
              <View style={styles.loadingSectionContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
              </View>
            ) : popularHosts.length > 0 ? (
              <FlatList
                data={popularHosts}
                renderItem={renderHostItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            ) : (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyText}>
                  No hosts available
                </Text>
              </View>
            )}
          </View>

          {/* Bottom padding to account for mini player */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Mini Player */}
        {currentTrack && <MiniPlayer />}
      </Animated.View>
    </SafeAreaView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingSectionContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  featuredPodcastBanner: {
    height: 240,
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredPodcastImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  featuredPodcastOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  featuredPodcastBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#1DB954',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  featuredPodcastBadgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuredPodcastTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  featuredPodcastHost: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  featuredPodcastDescription: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 15,
  },
  featuredPodcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  featuredPodcastButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 20,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  emptyListContainer: {
    width: width - 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 8,
    marginHorizontal: 20,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
  },
  podcastItem: {
    width: 170,
    marginHorizontal: 8,
  },
  podcastImage: {
    width: 170,
    height: 170,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#232323',
  },
  podcastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  podcastHost: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  podcastDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  podcastEpisodes: {
    color: '#999',
    fontSize: 10,
  },
  podcastCategory: {
    color: '#1DB954',
    fontSize: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  categoryGridItem: {
    width: width / 2 - 24,
    height: 80,
    marginHorizontal: 6,
    marginBottom: 12,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryGridName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 120,
  },
  categoryName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  hostItem: {
    width: 120,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  hostImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#232323',
  },
  hostName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  hostFollowers: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 80,
  },
  errorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 15,
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff6b6b',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  overlayLoadingContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingOverlay: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  overlayLoadingText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
});

export default PodcastScreen;

