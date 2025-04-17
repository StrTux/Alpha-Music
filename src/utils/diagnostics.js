/**
 * Diagnostics utility for music player app
 * 
 * This file contains utilities to diagnose common issues:
 * - API connectivity
 * - Environment variables
 * - Permissions
 * - Storage
 */

import axios from 'axios';
import { BASE_URL } from '../config/constants';

// Log important environment info
export const logEnvironmentInfo = () => {
  console.log('Environment Diagnostics:');
  console.log('- BASE_URL:', BASE_URL || 'Not defined');
  
  // Check if BASE_URL is a valid URL
  if (BASE_URL) {
    try {
      new URL(BASE_URL);
      console.log('- BASE_URL format:', 'Valid URL');
    } catch (e) {
      console.error('- BASE_URL format:', 'Invalid URL', e.message);
    }
  }
};

// Test API connectivity
export const testApiConnectivity = async () => {
  console.log('Testing API connectivity...');
  
  if (!BASE_URL) {
    console.error('Cannot test API: BASE_URL is not defined');
    return {
      success: false,
      error: 'BASE_URL is not defined'
    };
  }
  
  try {
    // Try basic endpoints
    const endpoints = [
      '/search/top',       
      '/podcast/trending', 
      '/get/trending'          
    ];
    
    const results = {};
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const startTime = Date.now();
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
          timeout: 5000 // 5 second timeout
        });
        const endTime = Date.now();
        
        results[endpoint] = {
          success: true,
          status: response.status,
          responseTime: `${endTime - startTime}ms`,
          dataStatus: response.data?.status
        };
        
        console.log(`✅ Endpoint ${endpoint}: ${response.status} (${endTime - startTime}ms)`);
      } catch (error) {
        results[endpoint] = {
          success: false,
          error: error.message
        };
        console.error(`❌ Endpoint ${endpoint}: ${error.message}`);
      }
    }
    
    // Determine overall status
    const allSuccessful = Object.values(results).every(r => r.success);
    
    return {
      success: allSuccessful,
      endpoints: results,
      message: allSuccessful 
        ? 'All API endpoints are accessible' 
        : 'Some API endpoints could not be reached'
    };
  } catch (error) {
    console.error('Error during API connectivity test:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run diagnostics on app startup
export const runStartupDiagnostics = async () => {
  console.log('Running startup diagnostics...');
  
  // Step 1: Log environment info
  logEnvironmentInfo();
  
  // Step 2: Test API connectivity
  const apiTest = await testApiConnectivity();
  
  // Step 3: Summarize results
  console.log('Diagnostics Summary:');
  console.log('- API Connectivity:', apiTest.success ? '✅ OK' : '❌ Failed');
  
  if (!apiTest.success) {
    console.error('API Issues:', apiTest.message || apiTest.error);
    console.log('Attempted endpoints:', Object.keys(apiTest.endpoints || {}).join(', '));
  }
  
  return {
    environmentOk: !!BASE_URL,
    apiOk: apiTest.success,
    ready: !!BASE_URL && apiTest.success
  };
};

export default {
  logEnvironmentInfo,
  testApiConnectivity,
  runStartupDiagnostics
}; 
