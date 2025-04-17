// API Configuration
export const BASE_URL = 'https://strtux-main.vercel.app';

// API Request Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds timeout
  maxRetries: 2,
  retryDelay: 1000,
  cacheTime: 5 * 60 * 1000, // 5 minutes cache
};

// Disable API health checks in production
export const DISABLE_API_HEALTH_CHECK = true;

// Rate limiting configuration
export const RATE_LIMIT = {
  maxRequests: 30, // Maximum requests per window
  timeWindow: 60 * 1000, // 1 minute window
};

// Cache configuration
export const CACHE_CONFIG = {
  enabled: true,
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxSize: 100, // Maximum number of cached items
};

// Add other constants here if needed
export const API_ENDPOINTS = {
  PODCASTS: `${BASE_URL}/api/podcasts`,
  MUSIC: `${BASE_URL}/api/music`,
  // Add more endpoints as needed
}; 