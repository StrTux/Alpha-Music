// Importing necessary modules
import axios from 'axios'; // For making HTTP requests
import {apiService} from './ApiService'; // Assuming you have apiService defined in another file
import {handleApiError} from './ErrorHandler'; // Assuming you have an error handling function
import {getMockTrendingSongs, getMockNewReleases} from './MockData'; // Assuming you have mock data functions
import {mockResponseFormat} from './ResponseFormat'; // Assuming you have mock response format defined
import {BASE_URL} from './config'; // Assuming you have a config file where BASE_URL is stored

// Set the flag for mock data (to switch between mock and real data)
const useMockData = false; // Set to false to use the real API

// Get trending songs - helper method used by old code
export const getTrendingSongs = async (limit = 20) => {
  if (useMockData) {
    return getMockTrendingSongs();
  }

  try {
    // First try dedicated trending endpoint if it exists
    const response = await apiService.get('/get/trending', {
      params: { limit }
    }).catch(() => null);

    if (response && response.data) {
      return response.data;
    }

    // Fallback to home data trending section
    const homeData = await apiService.get('/home');
    if (homeData && homeData.data && homeData.data.trending) {
      return {
        ...mockResponseFormat,
        message: 'Trending songs fetched successfully',
        data: homeData.data.trending.slice(0, limit),
      };
    }

    return getMockTrendingSongs();
  } catch (error) {
    const errorResponse = handleApiError(error);
    return useMockData ? getMockTrendingSongs() : errorResponse;
  }
};

// Get new releases - helper method used by old code
export const getNewReleases = async (limit = 20) => {
  if (useMockData) {
    return getMockNewReleases();
  }

  try {
    // First try dedicated new releases endpoint if it exists
    const response = await apiService.get('/albums/new', {
      params: { limit }
    }).catch(() => null);

    if (response && response.data) {
      return response.data;
    }

    // Fallback to home data new releases section
    const homeData = await apiService.get('/home');
    if (homeData && homeData.data && homeData.data.newReleases) {
      return {
        ...mockResponseFormat,
        message: 'New releases fetched successfully',
        data: homeData.data.newReleases.slice(0, limit),
      };
    }

    return getMockNewReleases();
  } catch (error) {
    const errorResponse = handleApiError(error);
    return useMockData ? getMockNewReleases() : errorResponse;
  }
};

// Get song recommendations
export const getSongRecommendations = async (songId, limit = 10) => {
  if (useMockData) {
    return {
      ...mockResponseFormat,
      message: 'Song recommendations fetched successfully',
      data: getMockTrendingSongs().data.slice(0, limit),
    };
  }

  try {
    const response = await apiService.get('/song/recommendations', {
      params: { id: songId, limit }
    }).catch(() => null);

    if (response && response.data) {
      return response.data;
    }

    // If no recommendations endpoint, use trending songs as fallback
    const trending = await getTrendingSongs(limit);
    return {
      ...mockResponseFormat,
      message: 'Song recommendations fetched successfully',
      data: trending.data || [],
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
};
