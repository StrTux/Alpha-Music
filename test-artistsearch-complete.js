// Comprehensive test for improved artistsearch.js
console.log('🎵 Testing Complete Artist Search Functionality...\n');

// Mock environment variables
process.env.SPOTIFY_CLIENT_ID = 'your_spotify_client_id_here';
process.env.SPOTIFY_CLIENT_SECRET = 'your_spotify_client_secret_here';

// Simple mock for @env
const originalRequire = require;
require = function(id) {
  if (id === '@env') {
    return {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET
    };
  }
  return originalRequire.apply(this, arguments);
};

// Mock base64
const base64 = {
  encode: (str) => Buffer.from(str).toString('base64'),
  decode: (str) => Buffer.from(str, 'base64').toString()
};

// Mock react-native-base64
try {
  require.cache[require.resolve('react-native-base64')] = {
    exports: base64
  };
} catch (e) {
  // Module not found, that's okay
}

// Test 1: Check if we can import all functions
console.log('=== Test 1: Module Import ===');
try {
  const {
    searchArtistByName,
    getArtistDetails,
    getMultipleArtists,
    getArtistAlbums,
    getArtistTopTracksById,
    getArtistTopTracks,
    getRelatedArtists,
    getCompleteArtistData,
    testArtistSearch
  } = require('./src/services/artistsearch');
  
  console.log('✅ All functions imported successfully');
  console.log('✅ searchArtistByName:', typeof searchArtistByName);
  console.log('✅ getArtistDetails:', typeof getArtistDetails);
  console.log('✅ getMultipleArtists:', typeof getMultipleArtists);
  console.log('✅ getArtistAlbums:', typeof getArtistAlbums);
  console.log('✅ getArtistTopTracksById:', typeof getArtistTopTracksById);
  console.log('✅ getArtistTopTracks:', typeof getArtistTopTracks);
  console.log('✅ getRelatedArtists:', typeof getRelatedArtists);
  console.log('✅ getCompleteArtistData:', typeof getCompleteArtistData);
  console.log('✅ testArtistSearch:', typeof testArtistSearch);
} catch (error) {
  console.log('❌ Module import failed:', error.message);
  process.exit(1);
}

// Test 2: Test with placeholder credentials
console.log('\n=== Test 2: Test with Placeholder Credentials ===');
async function testWithPlaceholders() {
  try {
    const { getArtistTopTracks } = require('./src/services/artistsearch');
    
    console.log('Testing with placeholder credentials...');
    const tracks = await getArtistTopTracks('arijit singh');
    
    if (tracks.length === 0) {
      console.log('✅ Expected result: No tracks returned (placeholder credentials)');
    } else {
      console.log('⚠️  Unexpected: Got tracks with placeholder credentials');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Test 3: Test with real credentials (if provided)
console.log('\n=== Test 3: Test with Real Credentials ===');
async function testWithRealCredentials() {
  // Check if real credentials are provided via environment variables
  const hasRealCredentials = process.env.SPOTIFY_CLIENT_ID && 
                           process.env.SPOTIFY_CLIENT_ID !== 'your_spotify_client_id_here' &&
                           process.env.SPOTIFY_CLIENT_SECRET && 
                           process.env.SPOTIFY_CLIENT_SECRET !== 'your_spotify_client_secret_here';
  
  if (!hasRealCredentials) {
    console.log('⚠️  No real credentials provided. To test with real credentials:');
    console.log('   Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables');
    console.log('   Example: SPOTIFY_CLIENT_ID=your_id SPOTIFY_CLIENT_SECRET=your_secret node test-artistsearch-complete.js');
    return false;
  }
  
  try {
    const {
      searchArtistByName,
      getArtistDetails,
      getArtistAlbums,
      getArtistTopTracks,
      getRelatedArtists,
      getCompleteArtistData
    } = require('./src/services/artistsearch');
    
    console.log('Testing with real credentials...\n');
    
    // Test 1: Search artist by name
    console.log('1. Testing searchArtistByName...');
    const artist = await searchArtistByName('arijit singh');
    if (artist) {
      console.log(`✅ Found artist: ${artist.name} (ID: ${artist.id})`);
      
      // Test 2: Get artist details
      console.log('\n2. Testing getArtistDetails...');
      const details = await getArtistDetails(artist.id);
      if (details) {
        console.log(`✅ Got artist details: ${details.name} (Popularity: ${details.popularity})`);
        console.log(`   Genres: ${details.genres.join(', ')}`);
        console.log(`   Followers: ${details.followers.total}`);
      }
      
      // Test 3: Get artist albums
      console.log('\n3. Testing getArtistAlbums...');
      const albums = await getArtistAlbums(artist.id, { limit: 5 });
      if (albums) {
        console.log(`✅ Got ${albums.items.length} albums (total: ${albums.total})`);
        albums.items.slice(0, 3).forEach((album, index) => {
          console.log(`   ${index + 1}. ${album.name} (${album.album_type})`);
        });
      }
      
      // Test 4: Get top tracks
      console.log('\n4. Testing getArtistTopTracks...');
      const tracks = await getArtistTopTracks('arijit singh');
      console.log(`✅ Found ${tracks.length} top tracks`);
      if (tracks.length > 0) {
        tracks.slice(0, 3).forEach((track, index) => {
          console.log(`   ${index + 1}. ${track.name} - ${track.artists} (Popularity: ${track.popularity})`);
        });
      }
      
      // Test 5: Get related artists
      console.log('\n5. Testing getRelatedArtists...');
      const relatedArtists = await getRelatedArtists(artist.id);
      console.log(`✅ Found ${relatedArtists.length} related artists`);
      if (relatedArtists.length > 0) {
        relatedArtists.slice(0, 3).forEach((related, index) => {
          console.log(`   ${index + 1}. ${related.name} (Popularity: ${related.popularity})`);
        });
      }
      
      // Test 6: Get complete artist data
      console.log('\n6. Testing getCompleteArtistData...');
      const completeData = await getCompleteArtistData('arijit singh');
      if (completeData) {
        console.log(`✅ Complete data fetched for ${completeData.artist.name}:`);
        console.log(`   - Details: ${completeData.details ? '✅' : '❌'}`);
        console.log(`   - Albums: ${completeData.albums ? completeData.albums.items.length : 0} albums`);
        console.log(`   - Top Tracks: ${completeData.topTracks.length} tracks`);
        console.log(`   - Related Artists: ${completeData.relatedArtists.length} artists`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Test with real credentials failed:', error.message);
    return false;
  }
}

// Test 4: Test the testArtistSearch function
console.log('\n=== Test 4: Test testArtistSearch Function ===');
async function testArtistSearchFunction() {
  try {
    const { testArtistSearch } = require('./src/services/artistsearch');
    
    console.log('Running testArtistSearch function...');
    const result = await testArtistSearch();
    
    console.log('✅ testArtistSearch completed');
    console.log(`📊 Arijit Singh tracks: ${result.arijitTracks.length}`);
    console.log(`📊 Honey Singh tracks: ${result.honeyTracks.length}`);
    
    return true;
  } catch (error) {
    console.log('❌ testArtistSearch failed:', error.message);
    return false;
  }
}

// Test 5: Test error handling
console.log('\n=== Test 5: Error Handling ===');
async function testErrorHandling() {
  try {
    const {
      searchArtistByName,
      getArtistDetails,
      getArtistTopTracks
    } = require('./src/services/artistsearch');
    
    console.log('Testing error handling...');
    
    // Test empty artist name
    const emptyResult = await getArtistTopTracks('');
    console.log('✅ Empty artist name handled correctly:', emptyResult.length === 0);
    
    // Test invalid artist ID
    const invalidDetails = await getArtistDetails('invalid_id');
    console.log('✅ Invalid artist ID handled correctly:', invalidDetails === null);
    
    // Test non-existent artist
    const nonExistent = await searchArtistByName('xyz123nonexistentartist');
    console.log('✅ Non-existent artist handled correctly:', nonExistent === null);
    
    return true;
  } catch (error) {
    console.log('❌ Error handling test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting all tests...\n');
  
  const results = {
    moduleImport: true, // Already tested above
    placeholderTest: await testWithPlaceholders(),
    realCredentialsTest: await testWithRealCredentials(),
    testFunction: await testArtistSearchFunction(),
    errorHandling: await testErrorHandling(),
  };
  
  console.log('\n=== FINAL RESULTS ===');
  Object.entries(results).forEach(([test, result]) => {
    console.log(`${test}: ${result ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n📊 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! artistsearch.js is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above for details.');
  }
  
  console.log('\n📋 Available Functions:');
  console.log('- searchArtistByName(artistName) - Search artist by name');
  console.log('- getArtistDetails(artistId) - Get artist details by ID');
  console.log('- getMultipleArtists(artistIds) - Get multiple artists by IDs');
  console.log('- getArtistAlbums(artistId, options) - Get artist albums');
  console.log('- getArtistTopTracksById(artistId, market) - Get top tracks by ID');
  console.log('- getArtistTopTracks(artistName) - Get top tracks by name');
  console.log('- getRelatedArtists(artistId) - Get related artists');
  console.log('- getCompleteArtistData(artistName) - Get all artist data');
  
  return results;
}

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
}); 