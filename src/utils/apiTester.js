/**
 * API Tester Utility
 * 
 * This utility helps test if the JioSaavn API is working properly
 * and diagnose any connection issues.
 */

import axios from 'axios';
import { BASE_URL } from '../config/constants';

/**
 * Tests basic API connectivity
 * @returns {Promise<Object>} Test results
 */
export const testApiConnection = async () => {
  console.log('Testing API connection to:', BASE_URL);
  const results = {
    baseUrl: BASE_URL,
    isConnected: false,
    endpoints: {},
    error: null
  };

  try {
    // Test basic connectivity
    const response = await fetch(`${BASE_URL}/search/top`);
    results.isConnected = response.ok;
    results.statusCode = response.status;
    
    if (response.ok) {
      const data = await response.json();
      results.data = data;
    }
  } catch (error) {
    results.error = error.message;
    console.error('API connection test failed:', error);
  }

  return results;
};

/**
 * Tests multiple API endpoints
 * @returns {Promise<Object>} Test results for each endpoint
 */
export const testAllEndpoints = async () => {
  const endpoints = [
    '/search/top',
    '/search?q=arijit',
    '/podcast/trending',
    '/podcast/featured',
    '/artist/top-songs?artistid=459320',
    '/album?id=36692811',
    '/song?id=tPcK9crP'
  ];

  const results = {
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString(),
    endpointResults: {}
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const startTime = Date.now();
      const response = await fetch(`${BASE_URL}${endpoint}`);
      const endTime = Date.now();
      
      results.endpointResults[endpoint] = {
        success: response.ok,
        statusCode: response.status,
        responseTime: `${endTime - startTime}ms`
      };
      
      if (response.ok) {
        const data = await response.json();
        results.endpointResults[endpoint].dataStatus = data.status;
        results.endpointResults[endpoint].hasData = data.data !== null && data.data !== undefined;
      }
    } catch (error) {
      results.endpointResults[endpoint] = {
        success: false,
        error: error.message
      };
      console.error(`Error testing ${endpoint}:`, error);
    }
  }

  console.log('API Test Results:', JSON.stringify(results, null, 2));
  return results;
};

/**
 * Run this function to diagnose API issues
 */
export const diagnoseApiIssues = async () => {
  console.log('Starting API diagnosis...');
  
  try {
    // Test basic connectivity
    const connectionTest = await testApiConnection();
    
    if (!connectionTest.isConnected) {
      console.error('❌ Cannot connect to API. Check your internet connection and BASE_URL.');
      return {
        success: false,
        message: 'Cannot connect to API',
        details: connectionTest
      };
    }
    
    console.log('✅ Basic API connection successful');
    
    // Test all endpoints
    const endpointTests = await testAllEndpoints();
    
    const failedEndpoints = Object.entries(endpointTests.endpointResults)
      .filter(([_, result]) => !result.success)
      .map(([endpoint]) => endpoint);
    
    if (failedEndpoints.length > 0) {
      console.warn(`⚠️ ${failedEndpoints.length} endpoints failed:`, failedEndpoints);
      return {
        success: false,
        message: 'Some API endpoints failed',
        failedEndpoints,
        details: endpointTests
      };
    }
    
    console.log('✅ All API endpoints tested successfully');
    return {
      success: true,
      message: 'API is working correctly',
      details: endpointTests
    };
    
  } catch (error) {
    console.error('❌ Error during API diagnosis:', error);
    return {
      success: false,
      message: 'Error during diagnosis',
      error: error.message
    };
  }
};

// Export a function to test a specific endpoint
export const testEndpoint = async (endpoint) => {
  try {
    console.log(`Testing specific endpoint: ${endpoint}`);
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const endTime = Date.now();
    
    const result = {
      endpoint,
      success: response.ok,
      statusCode: response.status,
      responseTime: `${endTime - startTime}ms`
    };
    
    if (response.ok) {
      const data = await response.json();
      result.data = data;
    } else {
      result.errorText = await response.text();
    }
    
    console.log(`Test result for ${endpoint}:`, result);
    return result;
  } catch (error) {
    console.error(`Error testing ${endpoint}:`, error);
    return {
      endpoint,
      success: false,
      error: error.message
    };
  }
}; 