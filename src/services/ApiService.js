import axios from 'axios';
import {
  getMockSearchResults,
  getMockTrendingSongs,
  getMockNewReleases,
  getMockSongDetails,
  getMockAlbumDetails,
  getMockPlaylistDetails,
  getMockArtistDetails,
  mockResponseFormat,
  getMockRadioStation,
  mockTracks,
} from '../utils/mockData';
import {Platform} from 'react-native';
import { BASE_URL, API_CONFIG, CACHE_CONFIG, RATE_LIMIT } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Log the base URL during initialization to help with debugging
console.log('API Service initializing with BASE_URL:', BASE_URL);

class ApiClient {
  constructor() {
    this.requests = new Map();
    this.cache = new Map();
    this.requestCount = 0;
    this.lastResetTime = Date.now();
    
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: API_CONFIG.timeout,
    });

    // Add request interceptor for rate limiting and caching
    this.api.interceptors.request.use(async (config) => {
      // Check rate limit
      if (this.isRateLimited()) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      // Generate cache key
      const cacheKey = `${config.method}:${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
      
      // Check cache
      if (CACHE_CONFIG.enabled && config.method === 'get') {
        const cachedResponse = await this.getFromCache(cacheKey);
        if (cachedResponse) {
          // Return cached response
          return Promise.reject({
            response: cachedResponse,
            __CACHED: true
          });
        }
      }

      // Track request
      this.trackRequest();
      return config;
    });

    // Add response interceptor for caching
    this.api.interceptors.response.use(
      async (response) => {
        // Cache successful GET responses
        if (CACHE_CONFIG.enabled && response.config.method === 'get') {
          const cacheKey = `${response.config.method}:${response.config.url}${response.config.params ? JSON.stringify(response.config.params) : ''}`;
          await this.setCache(cacheKey, response);
        }
        return response;
      },
      async (error) => {
        // Return cached response if available
        if (error.__CACHED) {
          return error.response;
        }
        throw error;
      }
    );
  }

  // Track request count for rate limiting
  trackRequest() {
    const now = Date.now();
    if (now - this.lastResetTime > RATE_LIMIT.timeWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }
    this.requestCount++;
  }

  // Check if rate limited
  isRateLimited() {
    const now = Date.now();
    if (now - this.lastResetTime > RATE_LIMIT.timeWindow) {
      this.requestCount = 0;
      this.lastResetTime = now;
      return false;
    }
    return this.requestCount >= RATE_LIMIT.maxRequests;
  }

  // Get from cache
  async getFromCache(key) {
    try {
      const cached = await AsyncStorage.getItem(`api_cache:${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_CONFIG.maxAge) {
          return data;
        }
        // Remove expired cache
        await AsyncStorage.removeItem(`api_cache:${key}`);
      }
    } catch (error) {
      console.warn('Cache read error:', error);
    }
    return null;
  }

  // Set cache
  async setCache(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(`api_cache:${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  // Clear cache
  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('api_cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // Generic request method with debouncing
  async request(method, url, config = {}) {
    const requestKey = `${method}:${url}${config.params ? JSON.stringify(config.params) : ''}`;
    
    // Check for existing request
    if (this.requests.has(requestKey)) {
      return this.requests.get(requestKey);
    }

    // Create new request promise
    const requestPromise = this.api.request({
      method,
      url,
      ...config
    }).finally(() => {
      // Remove request from tracking after completion
      this.requests.delete(requestKey);
    });

    // Track request
    this.requests.set(requestKey, requestPromise);
    
    return requestPromise;
  }

  // Convenience methods
  async get(url, config = {}) {
    return this.request('get', url, config);
  }

  async post(url, data, config = {}) {
    return this.request('post', url, { ...config, data });
  }

  async put(url, data, config = {}) {
    return this.request('put', url, { ...config, data });
  }

  async delete(url, config = {}) {
    return this.request('delete', url, config);
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Control whether to use mock data
let useMockData = false;

// Request queue management to prevent too many concurrent requests
const requestQueue = {
  maxConcurrent: 4,
  running: 0,
  queue: [],

  async add(requestPromise) {
    if (this.running < this.maxConcurrent) {
      this.running++;
      try {
        return await requestPromise();
      } finally {
        this.running--;
        this.processQueue();
      }
    } else {
      return new Promise((resolve, reject) => {
        this.queue.push({
          request: requestPromise,
          resolve,
          reject,
        });
      });
    }
  },

  processQueue() {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const {request, resolve, reject} = this.queue.shift();
      this.running++;
      request()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.processQueue();
        });
    }
  },
};

// Enhanced error handler
const handleApiError = (error) => {
  let errorMessage = 'An unknown error occurred';
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    errorMessage = `Server error: ${error.response.status} ${error.response.statusText}`;
    console.error('Error response data:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    errorMessage = 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message;
  }
  
  return {
    status: 'Failed',
    message: errorMessage,
    error: error,
    data: null
  };
};

// Test API connection efficiently
const testApiConnection = async () => {
  try {
    // Test with a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const testResponse = await apiClient.get(`${BASE_URL}/search`, {
      signal: controller.signal,
      params: {q: 'test', limit: 1},
    });

    clearTimeout(timeoutId);

    if (testResponse.status >= 200 && testResponse.status < 400) {
      console.log('Connected to music API successfully');
      useMockData = false;
      return true;
    }

    console.warn('Music API returned unexpected status, using mock data');
    useMockData = true;
    return false;
  } catch (error) {
    console.warn('API unavailable, using mock data:', error.message);
    useMockData = true;
    return false;
  }
};

// Helper to ensure we always have data by falling back to mock
const safeApiCall = async (apiPromise, mockDataFn) => {
  try {
    const response = await requestQueue.add(apiPromise);
    if (response && response.data) {
      return response.data;
    }
    return mockDataFn();
  } catch (error) {
    const errorResponse = handleApiError(error);
    return mockDataFn();
  }
};

// Call testApiConnection initially but don't block on it
testApiConnection().catch(err => {
  console.warn('Error testing API connection:', err);
  useMockData = true;
});

// Cache for download URLs to reduce API calls
const urlCache = new Map();
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour cache expiry

// Clear the cache periodically to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, {timestamp}] of urlCache.entries()) {
    if (now - timestamp > CACHE_EXPIRY) {
      urlCache.delete(key);
    }
  }
}, 1000 * 60 * 15); // Check every 15 minutes

// Robust download URL retrieval system
const downloadUrlService = {
  // Method 1: Using song name + artist name (Most reliable method)
  getURLsBySongAndArtist: async (songName, artistName) => {
    try {
      const query = `${songName} ${artistName}`.trim();
      const response = await apiClient.get(`${BASE_URL}/search/songs`, {
        params: {q: query, limit: 1},
      });

      const data = response.data?.data;
      if (data?.results?.length > 0 && data.results[0].download_url) {
        return {
          source: 'song_artist_search',
          downloadUrls: data.results[0].download_url,
          songDetails: data.results[0],
        };
      }
      throw new Error('No results found');
    } catch (error) {
      console.warn('Method 1 failed:', error.message);
      return null;
    }
  },

  // Method 2: Using song name only
  getURLsBySongName: async songName => {
    try {
      const response = await apiClient.get(`${BASE_URL}/search/songs`, {
        params: {q: songName, limit: 1},
      });

      const data = response.data?.data;
      if (data?.results?.length > 0 && data.results[0].download_url) {
        return {
          source: 'song_search',
          downloadUrls: data.results[0].download_url,
          songDetails: data.results[0],
        };
      }
      throw new Error('No results found');
    } catch (error) {
      console.warn('Method 2 failed:', error.message);
      return null;
    }
  },

  // Method 3: Using artist's top songs
  getURLsFromArtistTopSongs: async (artistId, songName) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/artist/top-songs`, {
        params: {artist_id: artistId},
      });

      const songs = response.data?.data || [];

      // Find matching song
      const matchingSong = songs.find(song =>
        song.name.toLowerCase().includes(songName.toLowerCase()),
      );

      if (matchingSong?.download_url) {
        return {
          source: 'artist_top_songs',
          downloadUrls: matchingSong.download_url,
          songDetails: matchingSong,
        };
      }
      throw new Error('Song not found in artist top songs');
    } catch (error) {
      console.warn('Method 3 failed:', error.message);
      return null;
    }
  },

  // Method 4: Use trending songs endpoint (rarely needed fallback)
  getURLsFromTrending: async songName => {
    try {
      const response = await apiClient.get(`${BASE_URL}/get/trending`);

      const trending = response.data?.data || [];

      // Filter only songs, not albums
      const trendingSongs = trending.filter(item => item.type === 'song');

      // Find matching song
      const matchingSong = trendingSongs.find(song =>
        song.name.toLowerCase().includes(songName.toLowerCase()),
      );

      if (matchingSong?.download_url) {
        return {
          source: 'trending',
          downloadUrls: matchingSong.download_url,
          songDetails: matchingSong,
        };
      }
      throw new Error('Song not found in trending');
    } catch (error) {
      console.warn('Method 4 failed:', error.message);
      return null;
    }
  },

  // Main function that tries all methods with fallbacks and caching
  getSongDownloadURLs: async (song, artist) => {
    try {
      // Extract necessary information
      const songName = song.name || '';
      const songId = song.id || '';
      const artistName = artist?.name || '';
      const artistId = artist?.id || '';

      // Create a cache key
      const cacheKey = `${songId || songName}:${artistId || artistName}`;

      // Check cache first
      if (urlCache.has(cacheKey)) {
        const cachedData = urlCache.get(cacheKey);
        // Check if cache is still valid
        if (Date.now() - cachedData.timestamp < CACHE_EXPIRY) {
          console.log(`Using cached download URLs for "${songName}"`);
          return cachedData.data;
        } else {
          // Cache expired, remove it
          urlCache.delete(cacheKey);
        }
      }

      console.log(
        `Fetching download URLs for "${songName}" by "${artistName}"`,
      );

      // Try all methods in sequence until one succeeds
      let result = null;

      // Method 1: Use song name + artist name
      if (artistName) {
        result = await downloadUrlService.getURLsBySongAndArtist(
          songName,
          artistName,
        );
        if (result) {
          urlCache.set(cacheKey, {data: result, timestamp: Date.now()});
          return result;
        }
      }

      // Method 2: Use song name only
      result = await downloadUrlService.getURLsBySongName(songName);
      if (result) {
        urlCache.set(cacheKey, {data: result, timestamp: Date.now()});
        return result;
      }

      // Method 3: Use artist's top songs
      if (artistId) {
        result = await downloadUrlService.getURLsFromArtistTopSongs(
          artistId,
          songName,
        );
        if (result) {
          urlCache.set(cacheKey, {data: result, timestamp: Date.now()});
          return result;
        }
      }

      // Method 4: Check trending songs
      result = await downloadUrlService.getURLsFromTrending(songName);
      if (result) {
        urlCache.set(cacheKey, {data: result, timestamp: Date.now()});
        return result;
      }

      // If all methods fail
      console.error(`Failed to get download URLs for "${songName}"`);
      return null;
    } catch (error) {
      console.error('Error getting download URLs:', error);
      return null;
    }
  },

  // Get the best quality download URL from download_url array
  getBestQualityURL: (downloadUrls, preferredQuality = '320kbps') => {
    if (!Array.isArray(downloadUrls) || downloadUrls.length === 0) {
      return null;
    }

    // Try to find preferred quality
    const preferred = downloadUrls.find(
      url => url.quality === preferredQuality,
    );
    if (preferred) {
      return preferred.link;
    }

    // Sort by quality (assuming format like "320kbps")
    const sortedUrls = [...downloadUrls].sort((a, b) => {
      const qualityA = parseInt(a.quality);
      const qualityB = parseInt(b.quality);
      return qualityB - qualityA; // Descending order
    });

    // Return highest available quality
    return sortedUrls[0].link;
  },
};

// API services - Create and export a single apiService object
const apiService = {
  // Client reference for direct access
  client: apiClient,
  
  // ============ SEARCH ENDPOINTS ============

  // Global search (songs, albums, artists)
  search: async (query, limit = 100, abortSignal = null) => {
    if (useMockData) {
      return getMockSearchResults(query);
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/search`, {
        params: {q: query, limit},
        signal: abortSignal,
      });

      if (!response.data) {
        return getMockSearchResults(query);
      }

      return response.data;
    } catch (error) {
      // Don't log or handle aborted requests as errors
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Search request was aborted');
        return null;
      }

      const errorResponse = handleApiError(error);
      return useMockData ? getMockSearchResults(query) : errorResponse;
    }
  },

  // Search specifically for songs
  searchSongs: async (query, limit = 100) => {
    if (useMockData) {
      return getMockSearchResults(query, 'songs');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/search/songs`, {
        params: {q: query, limit},
      });

      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockSearchResults(query, 'songs') : errorResponse;
    }
  },

  // Search specifically for albums
  searchAlbums: async (query, limit = 100) => {
    if (useMockData) {
      return getMockSearchResults(query, 'albums');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/search/albums`, {
        params: {q: query, limit},
      });

      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? getMockSearchResults(query, 'albums')
        : errorResponse;
    }
  },

  // ============ SONG ENDPOINTS ============

  // Get song details by ID
  getSongDetails: async songId => {
    if (useMockData) {
      return getMockSongDetails(songId);
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/song`, {
        params: {id: songId},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockSongDetails(songId) : errorResponse;
    }
  },

  // Get song details by URL
  getSongByUrl: async url => {
    if (useMockData) {
      return getMockSongDetails('mock-song-from-url');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/song`, {
        params: {link: url},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? getMockSongDetails('mock-song-from-url')
        : errorResponse;
    }
  },

  // Get multiple songs
  getMultipleSongs: async songIds => {
    if (useMockData) {
      return {
        ...mockResponseFormat,
        message: 'Multiple songs fetched successfully',
        data: Array.isArray(songIds)
          ? songIds.map(id => getMockSongDetails(id).data)
          : [getMockSongDetails('1').data],
      };
    }

    // songIds should be a comma-separated string or an array
    const idsParam = Array.isArray(songIds) ? songIds.join(',') : songIds;

    try {
      const response = await apiClient.get(`${BASE_URL}/song`, {
        params: {id: idsParam},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? {
            ...mockResponseFormat,
            message: 'Multiple songs fetched successfully',
            data: Array.isArray(songIds)
              ? songIds.map(id => getMockSongDetails(id).data)
              : [getMockSongDetails('1').data],
          }
        : errorResponse;
    }
  },

  // ============ ALBUM ENDPOINTS ============

  // Get album details by ID
  getAlbumDetails: async albumId => {
    if (useMockData) {
      return getMockAlbumDetails(albumId);
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/album`, {
        params: {id: albumId},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockAlbumDetails(albumId) : errorResponse;
    }
  },

  // Get album by URL
  getAlbumByUrl: async url => {
    if (useMockData) {
      return getMockAlbumDetails('mock-album-from-url');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/album`, {
        params: {link: url},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? getMockAlbumDetails('mock-album-from-url')
        : errorResponse;
    }
  },

  // ============ ARTIST ENDPOINTS ============

  // Get artist details
  getArtistDetails: async artistId => {
    if (useMockData) {
      return getMockArtistDetails(artistId);
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/artist`, {
        params: {id: artistId},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockArtistDetails(artistId) : errorResponse;
    }
  },

  // Get artist songs
  getArtistSongs: async (artistId, limit = 100) => {
    if (useMockData) {
      return {
        ...mockResponseFormat,
        message: 'Artist songs fetched successfully',
        data: getMockSearchResults('artist song').data,
      };
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/artist/songs`, {
        params: {id: artistId, limit},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? {
            ...mockResponseFormat,
            message: 'Artist songs fetched successfully',
            data: getMockSearchResults('artist song').data,
          }
        : errorResponse;
    }
  },

  // Get artist albums
  getArtistAlbums: async (artistId, limit = 100) => {
    if (useMockData) {
      return {
        ...mockResponseFormat,
        message: 'Artist albums fetched successfully',
        data: getMockNewReleases().data,
      };
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/artist/albums`, {
        params: {id: artistId, limit},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? {
            ...mockResponseFormat,
            message: 'Artist albums fetched successfully',
            data: getMockNewReleases().data,
          }
        : errorResponse;
    }
  },

  // ============ PLAYLIST ENDPOINTS ============

  // Get playlist details
  getPlaylistDetails: async playlistId => {
    if (useMockData) {
      return getMockPlaylistDetails(playlistId);
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/playlist`, {
        params: {id: playlistId},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockPlaylistDetails(playlistId) : errorResponse;
    }
  },

  // Get playlist by URL
  getPlaylistByUrl: async url => {
    if (useMockData) {
      return getMockPlaylistDetails('mock-playlist-from-url');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/playlist`, {
        params: {link: url},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? getMockPlaylistDetails('mock-playlist-from-url')
        : errorResponse;
    }
  },

  // ============ RADIO ENDPOINTS ============

  // Get featured radio
  getFeaturedRadio: async name => {
    if (useMockData) {
      return getMockRadioStation(name, 'featured');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/radio/featured`, {
        params: {name},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? getMockRadioStation(name, 'featured')
        : errorResponse;
    }
  },

  // Get artist radio
  getArtistRadio: async name => {
    if (useMockData) {
      return getMockRadioStation(name, 'artist');
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/radio/artist`, {
        params: {name},
      });
      return response.data;
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockRadioStation(name, 'artist') : errorResponse;
    }
  },

  // ============ TRENDING/RECOMMENDATIONS ENDPOINTS ============

  // Get trending songs - helper method used by old code
  getTrendingSongs: async (limit = 100) => {
    if (useMockData) {
      return getMockTrendingSongs();
    }

    try {
      // First try dedicated trending endpoint if it exists
      const response = await apiClient
        .get(`${BASE_URL}/get/trending`, {
          params: {limit},
        })
        .catch(() => null);

      if (response && response.data) {
        return response.data;
      }

      // Fallback to home data trending section
      const homeResponse = await apiClient.get(`${BASE_URL}/`).catch(() => null);
      if (homeResponse && homeResponse.data && homeResponse.data.trending) {
        return {
          status: 'Success',
          message: 'Trending songs fetched successfully',
          data: homeResponse.data.trending.slice(0, limit),
        };
      }

      return getMockTrendingSongs();
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockTrendingSongs() : errorResponse;
    }
  },

  // Get new releases - helper method used by old code
  getNewReleases: async (limit = 100) => {
    if (useMockData) {
      return getMockNewReleases();
    }

    try {
      // First try dedicated new releases endpoint if it exists
      const response = await apiClient
        .get(`${BASE_URL}/albums/new`, {
          params: {limit},
        })
        .catch(() => null);

      if (response && response.data) {
        return response.data;
      }

      // Fallback to home data new releases section
      const homeResponse = await apiClient.get(`${BASE_URL}/`).catch(() => null);
      if (homeResponse && homeResponse.data && homeResponse.data.newReleases) {
        return {
          status: 'Success',
          message: 'New releases fetched successfully',
          data: homeResponse.data.newReleases.slice(0, limit),
        };
      }

      return getMockNewReleases();
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData ? getMockNewReleases() : errorResponse;
    }
  },

  // Get song recommendations
  getSongRecommendations: async (songId, limit = 10) => {
    if (useMockData) {
      return {
        ...mockResponseFormat,
        message: 'Song recommendations fetched successfully',
        data: getMockTrendingSongs().data.slice(0, limit),
      };
    }

    try {
      const response = await apiClient
        .get(`${BASE_URL}/song/recommendations`, {
          params: {id: songId, limit},
        })
        .catch(() => null);

      if (response && response.data) {
        return response.data;
      }

      // If no recommendations endpoint, use trending songs as fallback
      return {
        ...mockResponseFormat,
        message: 'Song recommendations fetched successfully',
        data: getMockTrendingSongs().data.slice(0, limit),
      };
    } catch (error) {
      const errorResponse = handleApiError(error);
      return useMockData
        ? {
            ...mockResponseFormat,
            message: 'Song recommendations fetched successfully',
            data: getMockTrendingSongs().data.slice(0, limit),
          }
        : errorResponse;
    }
  },

  // ============ HOME DATA ============

  // Get home data (trending, new releases, etc.)
  getHomeData: async (abortSignal = null) => {
    // If mock data is enabled, return mock data immediately
    if (useMockData) {
      return {
        ...mockResponseFormat,
        message: 'Home data fetched successfully',
        data: {
          trending: mockTracks,
          newReleases: mockTracks.slice(1, 5),
          topArtists: [],
          playlists: [],
        },
      };
    }

    try {
      const response = await apiClient.get(`${BASE_URL}/`, {
        signal: abortSignal,
      });

      return response.data;
    } catch (error) {
      // Don't log or handle aborted requests as errors
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        console.log('Home data request was aborted');
        return null;
      }

      // Always fall back to mock data on error
      console.error('Error fetching home data, using mocks:', error.message);
      return {
        ...mockResponseFormat,
        message: 'Home data fetched successfully (mock)',
        data: {
          trending: mockTracks,
          newReleases: mockTracks.slice(1, 5),
          topArtists: [],
          playlists: [],
        },
      };
    }
  },

  // Helper for API status
  isApiAvailable: async () => {
    return testApiConnection();
  },

  // Check if using mock data
  isUsingMockData: () => {
    return useMockData;
  },

  // Explicitly use mock data (useful for testing or offline mode)
  forceMockData: (force = true) => {
    useMockData = force;
    return useMockData;
  },

  // Get download URLs for a song using the robust method
  getDownloadURLs: async (song, artist) => {
    return downloadUrlService.getSongDownloadURLs(song, artist);
  },

  // Get the best quality URL from download_url array
  getBestQualityURL: (downloadUrls, preferredQuality) => {
    return downloadUrlService.getBestQualityURL(downloadUrls, preferredQuality);
  },

  // Process album to add download URLs to all songs
  processAlbumWithDownloadURLs: async album => {
    if (!album || !album.songs || album.songs.length === 0) {
      return album;
    }

    // Find the main artist for the album
    const artist = {
      id: album.artist_map?.primary_artists?.[0]?.id || '',
      name: album.artist_map?.primary_artists?.[0]?.name || album.subtitle,
    };

    // Process all songs in parallel
    const promises = album.songs.map(async song => {
      // Skip if song already has download URLs
      if (
        song.download_url &&
        Array.isArray(song.download_url) &&
        song.download_url.length > 0
      ) {
        return song;
      }

      // Get download URLs
      const result = await downloadUrlService.getSongDownloadURLs(song, artist);

      if (result) {
        // Add download URLs to the song
        return {
          ...song,
          download_url: result.downloadUrls,
        };
      }

      return song;
    });

    // Wait for all songs to be processed
    const processedSongs = await Promise.all(promises);

    // Return album with processed songs
    return {
      ...album,
      songs: processedSongs,
    };
  },

  // Add this method to fetch popular hosts/podcasts
  getPopularHosts: async () => {
    try {
      const response = await apiClient.get('/podcast/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular podcasts:', error);
      throw error;
    }
  },

  // Add this method to fetch trending podcasts
  getTrendingPodcasts: async () => {
    try {
      const response = await apiClient.get('/podcast/trending');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trending podcasts:', error);
      throw error;
    }
  },

  // Add this method to fetch featured podcasts
  getFeaturedPodcasts: async () => {
    try {
      const response = await apiClient.get('/podcast/featured');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching featured podcasts:', error);
      throw error;
    }
  },

  // Add this method to fetch podcast categories
  getPodcastCategories: async () => {
    const categories = [
      "Spirituality",
      "Stories",
      "True Crime",
      "Education",
      "Entertainment",
      "News",
      "Business",
      "Health & Lifestyle",
      "Sports",
      "Technology"
    ];
    
    return categories;
  },

  // Add method to fetch new podcast releases
  getNewPodcasts: async () => {
    try {
      const response = await apiClient.get('/podcast/new');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching new podcasts:', error);
      throw error;
    }
  },
  
  // Add method to fetch podcast episodes
  getPodcastEpisodes: async (podcastId) => {
    if (!podcastId) {
      throw new Error('Podcast ID is required');
    }
    
    try {
      const response = await apiClient.get(`/podcast/episodes`, {
        params: { id: podcastId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching podcast episodes:', error);
      throw error;
    }
  },
};

// Export the apiService as the default export and also export apiClient
export default apiService;
export { apiClient };

