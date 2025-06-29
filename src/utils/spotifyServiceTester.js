// Spotify Service Tester for React Native
// This utility can be imported and used in React Native components

import { SPOTIFY_CONFIG } from '../config/spotifyConfig';
import base64 from 'react-native-base64';

// Test 1: Environment Variables
export const testEnvironmentVariables = () => {
  console.log('=== Test 1: Environment Variables ===');
  try {
    const hasClientId = SPOTIFY_CONFIG.CLIENT_ID && SPOTIFY_CONFIG.CLIENT_ID !== 'your_spotify_client_id_here';
    const hasClientSecret = SPOTIFY_CONFIG.CLIENT_SECRET && SPOTIFY_CONFIG.CLIENT_SECRET !== 'your_spotify_client_secret_here';
    
    console.log('✅ SPOTIFY_CONFIG loaded');
    console.log('📋 SPOTIFY_CLIENT_ID:', hasClientId ? '✅ Valid' : '❌ Missing/Invalid');
    console.log('📋 SPOTIFY_CLIENT_SECRET:', hasClientSecret ? '✅ Valid' : '❌ Missing/Invalid');
    
    return { hasClientId, hasClientSecret };
  } catch (error) {
    console.log('❌ Environment test failed:', error.message);
    return { hasClientId: false, hasClientSecret: false };
  }
};

// Test 2: Base64 Encoding
export const testBase64Encoding = () => {
  console.log('\n=== Test 2: Base64 Encoding ===');
  try {
    const testString = 'test:secret';
    const encoded = base64.encode(testString);
    const decoded = base64.decode(encoded);
    
    console.log('✅ Base64 encoding works');
    console.log('📝 Test:', testString);
    console.log('🔐 Encoded:', encoded);
    console.log('🔓 Decoded:', decoded);
    
    return testString === decoded;
  } catch (error) {
    console.log('❌ Base64 test failed:', error.message);
    return false;
  }
};

// Test 3: Manual Token Request
export const testManualTokenRequest = async () => {
  console.log('\n=== Test 3: Manual Token Request ===');
  try {
    const { hasClientId, hasClientSecret } = testEnvironmentVariables();
    
    if (!hasClientId || !hasClientSecret) {
      console.log('⚠️  Skipping token test - credentials not configured');
      return false;
    }
    
    const credentials = base64.encode(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token obtained successfully');
      console.log('🔑 Token preview:', data.access_token.substring(0, 20) + '...');
      console.log('⏰ Expires in:', data.expires_in, 'seconds');
      return true;
    } else {
      console.log('❌ Token request failed:', response.status);
      const errorData = await response.text();
      console.log('📝 Error details:', errorData);
      return false;
    }
  } catch (error) {
    console.log('❌ Manual token test failed:', error.message);
    return false;
  }
};

// Test 4: Test getSpotifyToken Service
export const testGetSpotifyTokenService = async () => {
  console.log('\n=== Test 4: getSpotifyToken Service ===');
  try {
    const { getSpotifyToken } = require('../services/getSpotifyToken');
    console.log('✅ Service imported successfully');
    
    const token = await getSpotifyToken();
    console.log('✅ Token generated:', token ? 'Yes' : 'No');
    if (token) {
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    }
    return !!token;
  } catch (error) {
    console.log('❌ getSpotifyToken service failed:', error.message);
    return false;
  }
};

// Test 5: Test SpotifyService
export const testSpotifyService = async () => {
  console.log('\n=== Test 5: SpotifyService ===');
  try {
    const SpotifyService = require('../services/SpotifyService').default;
    console.log('✅ Service imported successfully');
    
    const playlists = await SpotifyService.searchPlaylists('top playlist 100', 10);
    console.log(`✅ Playlist search: ${playlists.length} results`);
    
    if (playlists.length > 0) {
      console.log('📝 Sample playlist:', playlists[0].name);
    }
    return playlists.length > 0;
  } catch (error) {
    console.log('❌ SpotifyService failed:', error.message);
    return false;
  }
};

// Test 6: Test artistsearch Service
export const testArtistSearchService = async () => {
  console.log('\n=== Test 6: artistsearch Service ===');
  try {
    const { getArtistTopTracks } = require('../services/artistsearch');
    console.log('✅ Service imported successfully');
    
    const tracks = await getArtistTopTracks('arijit singh');
    console.log(`✅ Artist search: ${tracks.length} tracks`);
    
    if (tracks.length > 0) {
      console.log('📝 Sample track:', tracks[0].name);
    }
    return tracks.length > 0;
  } catch (error) {
    console.log('❌ artistsearch service failed:', error.message);
    return false;
  }
};

// Test 7: Test spotifytrack Service
export const testSpotifyTrackService = async () => {
  console.log('\n=== Test 7: spotifytrack Service ===');
  try {
    const { getAllSpotifyTracks } = require('../services/spotifytrack');
    console.log('✅ Service imported successfully');
    
    const playlistId = '37i9dQZF1DXbVhgADFy3im'; // Trending Now India
    const tracks = await getAllSpotifyTracks(playlistId);
    console.log(`✅ Playlist tracks: ${tracks.length} tracks`);
    
    if (tracks.length > 0) {
      console.log('📝 Sample track:', tracks[0].name);
    }
    return tracks.length > 0;
  } catch (error) {
    console.log('❌ spotifytrack service failed:', error.message);
    return false;
  }
};

// Test 8: Test spotifytest Service
export const testSpotifyTestService = async () => {
  console.log('\n=== Test 8: spotifytest Service ===');
  try {
    const { testSpotifyAPI } = require('../services/spotifytest');
    console.log('✅ Service imported successfully');
    
    await testSpotifyAPI();
    console.log('✅ API test completed successfully');
    return true;
  } catch (error) {
    console.log('❌ spotifytest service failed:', error.message);
    return false;
  }
};

// Test 9: Test trackPlayerService
export const testTrackPlayerService = () => {
  console.log('\n=== Test 9: trackPlayerService ===');
  try {
    const service = require('../services/trackPlayerService');
    console.log('✅ Service imported successfully');
    console.log('✅ Service type:', typeof service);
    return typeof service === 'function';
  } catch (error) {
    console.log('❌ trackPlayerService failed:', error.message);
    return false;
  }
};

// Run all tests
export const runAllSpotifyTests = async () => {
  console.log('🎵 Running All Spotify Service Tests...\n');
  
  const results = {
    environment: testEnvironmentVariables(),
    base64: testBase64Encoding(),
    manualToken: await testManualTokenRequest(),
    getSpotifyToken: await testGetSpotifyTokenService(),
    spotifyService: await testSpotifyService(),
    artistSearch: await testArtistSearchService(),
    spotifyTrack: await testSpotifyTrackService(),
    spotifyTest: await testSpotifyTestService(),
    trackPlayer: testTrackPlayerService(),
  };
  
  console.log('\n=== FINAL RESULTS ===');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Spotify integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  return results;
};

export default {
  testEnvironmentVariables,
  testBase64Encoding,
  testManualTokenRequest,
  testGetSpotifyTokenService,
  testSpotifyService,
  testArtistSearchService,
  testSpotifyTrackService,
  testSpotifyTestService,
  testTrackPlayerService,
  runAllSpotifyTests,
}; 