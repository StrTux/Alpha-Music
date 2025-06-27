import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useMusic} from '../../context/MusicContext';
import MiniPlayer from '../playerTab/MiniPlayer';

import axios from 'axios';

// API base URL - ensure this matches the one in other screens
const BASE_URL = "https://strtux-main.vercel.app";
const {width} = Dimensions.get('window');

// Default podcast image
const DEFAULT_PODCAST_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/004/844/942/small/podcast-icon-on-white-background-vector.jpg';

// Utility function to ensure high-quality images (reused from PodcastScreen)
const getHighQualityImage = (imageUrl) => {
  if (!imageUrl) return DEFAULT_PODCAST_IMAGE;
  
  // For JioSaavn, ensure we're getting the 500x500 version
  if (imageUrl.includes('saavncdn.com')) {
    return imageUrl.replace(/\d+x\d+/, '500x500');
  }
  
  return imageUrl;
};

// DEBUG flag - set to false in production
const DEBUG = true;

const PodcastCategorieScreen = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiDebugInfo, setApiDebugInfo] = useState('');
  const [usedFallback, setUsedFallback] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const abortControllerRef = useRef(null);
  const {currentTrack} = useMusic();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get category data from route params
  const category = route.params?.category || {
    id: 'category-default',
    name: 'Podcasts',
    icon: 'radio-outline',
    color: '#1DB954',
  };

  // Animation for fade-in effect
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim]);

  // Format podcast data function
  const formatPodcastData = useCallback((podcastData) => {
    if (!Array.isArray(podcastData)) {
      console.warn('Expected array for podcast data but got:', typeof podcastData);
      return [];
    }

    return podcastData.map((podcast) => ({
      id: podcast.id || `podcast-${Math.random().toString(36).substr(2, 9)}`,
      title: podcast.title || podcast.name || 'Unknown Podcast',
      host: podcast.artist || podcast.subtitle || 'Unknown Host',
      artwork: getHighQualityImage(podcast.image) || DEFAULT_PODCAST_IMAGE,
      description: podcast.description || podcast.subtitle || 'No description available',
      episodeCount: podcast.episode_count || podcast.episodeCount || 0,
      category: podcast.category || podcast.type || 'Podcast',
      url: podcast.url || podcast.perma_url || '',
      type: podcast.type || 'podcast',
      followers: podcast.followers || podcast.follower_count || '0',
      release_date: podcast.release_date || null,
    }));
  }, []);

  // Fetch podcasts by category
  const fetchPodcastsByCategory = useCallback(async (categoryName, signal) => {
    try {
      if (DEBUG) {
        console.log(`Fetching podcasts for category: ${categoryName}`);
      }

      // Properly encode the category name for the URL
      const encodedCategory = encodeURIComponent(categoryName);
      const url = `${BASE_URL}/podcast/category/${encodedCategory}`;
      
      if (DEBUG) {
        console.log(`API request URL: ${url}`);
      }

      const response = await axios.get(url, { signal });
      
      if (DEBUG) {
        console.log('API response status:', response.data.status);
        console.log('API response message:', response.data.message);
        console.log('API data count:', response.data.data ? response.data.data.length : 0);
      }

      if (response.status === 200 && response.data) {
        // Check if the response has the expected structure
        if (response.data.data && Array.isArray(response.data.data)) {
          const formattedData = formatPodcastData(response.data.data);
          setPodcasts(formattedData);
          setError('');
          
          // Set API debug info for display in DEBUG mode
          if (DEBUG) {
            setApiDebugInfo(`${categoryName} podcasts: ${formattedData.length} items (Note: API currently returns same data for all categories)`);
          }
          
          // Check if we're using a fallback or potentially duplicated data
          // We check message content because backend API is returning same data for different categories
          if (response.data.message.includes("fetched successfully") && categoryName !== "Spirituality") {
            setUsedFallback(true);
          } else {
            setUsedFallback(false);
          }
        } else {
          console.error('Unexpected API response format:', response.data);
          setPodcasts([]);
          setError(`Invalid data format received from server. Try another category or check the API.`);
        }
      } else {
        console.error('Failed to fetch podcasts:', response);
        setPodcasts([]);
        setError('Failed to load podcasts. Please try again later.');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
        return;
      }
      
      // Log the specific error details for debugging
      console.error('Error fetching podcasts:', error.message);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        
        if (error.response.status === 404) {
          setError(`The API endpoint for ${category.name} podcasts doesn't exist. This is a server issue.`);
        } else {
          setError(`Server error: ${error.response.status}. Please try again later.`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to fetch podcasts. Please try again later.');
      }
      
      setPodcasts([]);
    }
  }, [formatPodcastData]);

  // Initial data loading
  useEffect(() => {
    setIsLoading(true);
    setPodcasts([]);
    
    const controller = new AbortController();
    const signal = controller.signal;

    if (DEBUG) {
      console.log(`Loading podcasts for category: ${category.name}`);
    }

    // Fetch podcasts for the selected category
    fetchPodcastsByCategory(category.name, signal)
      .finally(() => {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [category.name, fetchPodcastsByCategory]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    // Cancel existing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    try {
      await fetchPodcastsByCategory(category.name, controller.signal);
    } catch (error) {
      setError('Failed to refresh podcasts. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [category.name, fetchPodcastsByCategory]);

  // Handle podcast press
  const handlePodcastPress = useCallback((podcast) => {
    Alert.alert(
      podcast.title,
      `Host: ${podcast.host}`,
      [
        {
          text: 'Listen Now',
          onPress: () => {
            console.log(`Starting podcast: ${podcast.title}`);
            // Add podcast playing logic here
          },
        },
        {
          text: 'View Episodes',
          onPress: () => {
            console.log(`View episodes for: ${podcast.title}`);
            // Navigate to podcast episodes screen
            // navigation.navigate('PodcastEpisodes', { podcastId: podcast.id, title: podcast.title });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  }, []);

  // Render podcast item
  const renderPodcastItem = useCallback(
    ({item}) => (
      <TouchableOpacity
        style={styles.podcastItem}
        onPress={() => handlePodcastPress(item)}
        activeOpacity={0.7}>
        <Image
          source={{uri: item.artwork}}
          style={styles.podcastImage}
          defaultSource={{uri: DEFAULT_PODCAST_IMAGE}}
        />
        <View style={styles.podcastDetails}>
          <Text style={styles.podcastTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.podcastHost} numberOfLines={1}>
            {item.host}
          </Text>
          {item.followers && (
            <Text style={styles.podcastFollowers}>
              {typeof item.followers === 'number' 
                ? `${item.followers.toLocaleString()} followers` 
                : item.followers}
            </Text>
          )}
        </View>
        <TouchableOpacity style={styles.playButton} onPress={() => handlePodcastPress(item)}>
          <Icon name="play-circle" size={32} color={category.color || '#1DB954'} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [category.color, handlePodcastPress]
  );

  // Render empty list component
  const renderEmptyList = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={category.color || '#1DB954'} />
          <Text style={styles.emptyText}>Loading podcasts...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={[styles.emptyText, {color: '#ff6b6b'}]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Icon name="radio-outline" size={50} color="#888" />
        <Text style={styles.emptyText}>No podcasts found for this category</Text>
      </View>
    );
  }, [isLoading, error, handleRefresh]);

  // Render header component
  const renderHeader = useCallback(() => (
    <View style={styles.headerContainer}>
      <View style={[styles.categoryIconContainer, {backgroundColor: category.color + '30'}]}>
        <Icon name={category.icon} size={40} color={category.color} />
      </View>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      <View style={styles.categoryBadge}>
        <Text style={[styles.categoryBadgeText, {color: category.color}]}>
          {category.name} Category
        </Text>
      </View>
      <Text style={styles.categoryDescription}>
        Explore the best {category.name.toLowerCase()} podcasts
      </Text>
      
      {usedFallback && (
        <View style={styles.fallbackNotice}>
          <Text style={styles.fallbackText}>
            Note: The API currently returns the same podcasts for all categories.
          </Text>
        </View>
      )}
      
      {DEBUG && apiDebugInfo && (
        <Text style={styles.debugText}>{apiDebugInfo}</Text>
      )}
    </View>
  ), [category, apiDebugInfo, usedFallback]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name} Podcasts</Text>
          <TouchableOpacity style={styles.searchButton}>
            <Icon name="search" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Main content */}
        <FlatList
          data={podcasts}
          renderItem={renderPodcastItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={category.color || '#1DB954'}
              colors={[category.color || '#1DB954']}
            />
          }
        />
        
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
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    padding: 8,
  },
  listContent: {
    paddingBottom: 80, // Space for MiniPlayer
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  categoryDescription: {
    color: '#bebebe',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  podcastItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    alignItems: 'center',
  },
  podcastImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#333',
  },
  podcastDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  podcastTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  podcastHost: {
    color: '#a0a0a0',
    fontSize: 14,
    marginBottom: 2,
  },
  podcastFollowers: {
    color: '#808080',
    fontSize: 12,
  },
  playButton: {
    padding: 10,
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    color: '#bebebe',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1DB954',
    borderRadius: 20,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fallbackNotice: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f39c12',
    borderRadius: 4,
  },
  fallbackText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugText: {
    color: '#888',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#111',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PodcastCategorieScreen;
