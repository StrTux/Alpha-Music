import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

// Constants
export const STORAGE_API_URL_KEY = 'api_base_url';
export const DEFAULT_PORT = '3500';

// The hosted backend URL
export const HOSTED_BACKEND_URL = 'https://strtux-main.vercel.app';

// List of potential server addresses to try
export const POTENTIAL_ADDRESSES = [
  // Hosted backend (primary)
  HOSTED_BACKEND_URL,
  // Local development fallbacks
  // Android emulators
  `http://10.0.2.2:${DEFAULT_PORT}`, // Standard Android emulator
  `http://10.0.3.2:${DEFAULT_PORT}`, // Genymotion
  // iOS simulator
  `http://localhost:${DEFAULT_PORT}`,
  // Common local network addresses
  `http://192.168.1.1:${DEFAULT_PORT}`,
  `http://192.168.0.1:${DEFAULT_PORT}`,
  `http://192.168.1.100:${DEFAULT_PORT}`,
  `http://192.168.1.101:${DEFAULT_PORT}`,
  `http://192.168.1.102:${DEFAULT_PORT}`,
  `http://192.168.1.103:${DEFAULT_PORT}`,
  `http://192.168.1.104:${DEFAULT_PORT}`,
  `http://192.168.1.105:${DEFAULT_PORT}`,
];

// Determine default API URL based on platform
export const getDefaultApiUrl = () => {
  // Default to the hosted backend
  return HOSTED_BACKEND_URL;
};

// Load saved API URL or use default
export const loadApiUrl = async () => {
  try {
    const storedUrl = await AsyncStorage.getItem(STORAGE_API_URL_KEY);
    if (storedUrl) {
      console.log('Using stored API URL:', storedUrl);
      return storedUrl;
    }
  } catch (error) {
    console.error('Error loading API URL from storage:', error);
  }

  const defaultUrl = getDefaultApiUrl();
  console.log('Using default API URL:', defaultUrl);
  return defaultUrl;
};

// Save custom API URL
export const saveApiUrl = async url => {
  if (!url) {
    return false;
  }

  try {
    // Ensure URL has http/https prefix
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `http://${url}`;
    }

    // Only add port if it's a local address (not the hosted backend)
    if (!url.includes(HOSTED_BACKEND_URL) && !url.includes(':')) {
      url = `${url}:${DEFAULT_PORT}`;
    }

    await AsyncStorage.setItem(STORAGE_API_URL_KEY, url);
    console.log('Saved custom API URL:', url);
    return true;
  } catch (error) {
    console.error('Error saving API URL:', error);
    return false;
  }
};

// Check if a specific server URL is reachable
export const checkServerUrl = async (url, timeout = 5000) => {
  try {
    console.log(`Testing server URL: ${url}`);

    // For the hosted backend, just check the base URL
    if (url.includes(HOSTED_BACKEND_URL)) {
      try {
        const response = await axios.get(url, {
          timeout,
          headers: {'Cache-Control': 'no-cache'},
        });

        console.log(
          `Hosted backend at ${url} is reachable, status: ${response.status}`,
        );
        return response.status >= 200 && response.status < 400;
      } catch (error) {
        console.log(
          `Hosted backend at ${url} is not reachable: ${error.message}`,
        );
        return false;
      }
    }

    // For other servers, try the health endpoint first
    try {
      const response = await axios.get(`${url}/health`, {
        timeout,
        headers: {'Cache-Control': 'no-cache'},
      });

      console.log(`Server at ${url} is reachable, status: ${response.status}`);
      return true;
    } catch (healthError) {
      // If health check fails, try the root endpoint
      const response = await axios.get(url, {
        timeout,
        headers: {'Cache-Control': 'no-cache'},
      });

      console.log(
        `Server at ${url} is reachable (root endpoint), status: ${response.status}`,
      );
      return true;
    }
  } catch (error) {
    console.log(`Server at ${url} is not reachable: ${error.message}`);
    return false;
  }
};

// Auto-discover server by trying multiple addresses
export const discoverServer = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('No network connection, skipping server discovery');
    return null;
  }

  // Try the hosted backend first
  const isHostedReachable = await checkServerUrl(HOSTED_BACKEND_URL);
  if (isHostedReachable) {
    console.log('Hosted backend is reachable:', HOSTED_BACKEND_URL);
    await saveApiUrl(HOSTED_BACKEND_URL);
    return HOSTED_BACKEND_URL;
  }

  // Try stored URL
  try {
    const storedUrl = await AsyncStorage.getItem(STORAGE_API_URL_KEY);
    if (storedUrl && storedUrl !== HOSTED_BACKEND_URL) {
      const isReachable = await checkServerUrl(storedUrl);
      if (isReachable) {
        console.log('Stored server URL is reachable:', storedUrl);
        return storedUrl;
      }
    }
  } catch (error) {
    console.error('Error checking stored URL:', error);
  }

  // Try other potential addresses
  for (const address of POTENTIAL_ADDRESSES) {
    if (address === HOSTED_BACKEND_URL) {
      continue;
    } // Skip already checked hosted backend

    const isReachable = await checkServerUrl(address);
    if (isReachable) {
      console.log('Found reachable server at:', address);
      // Save this successful address for future use
      await saveApiUrl(address);
      return address;
    }
  }

  console.log('Could not discover server automatically');
  return null;
};

// Export default configuration
export default {
  getDefaultApiUrl,
  loadApiUrl,
  saveApiUrl,
  checkServerUrl,
  discoverServer,
  POTENTIAL_ADDRESSES,
  HOSTED_BACKEND_URL,
  DEFAULT_PORT,
};
