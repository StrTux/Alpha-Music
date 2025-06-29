// Test script for Spotify integration
// Run this with: node test-spotify.js

import SpotifyService from './src/services/SpotifyService.js';

async function testSpotifyIntegration() {
  console.log('🎵 Testing Spotify Integration...\n');

  try {
    // Test 1: Search for playlists
    console.log('1. Testing playlist search...');
    const playlists = await SpotifyService.searchPlaylists('arjit singh', 3);
    console.log(`Found ${playlists.length} playlists:`);
    playlists.forEach((playlist, index) => {
      console.log(`   ${index + 1}. ${playlist.name} (${playlist.owner})`);
    });

    if (playlists.length > 0) {
      // Test 2: Get playlist details
      console.log('\n2. Testing playlist details...');
      const playlistId = playlists[0].spotify_id;
      const details = await SpotifyService.getPlaylistDetails(playlistId);
      console.log(`Playlist: ${details.name}`);
      console.log(`Owner: ${details.owner}`);
      console.log(`Tracks: ${details.total_tracks}`);

      // Test 3: Get playlist tracks
      console.log('\n3. Testing track fetching...');
      const tracks = await SpotifyService.getPlaylistTracks(playlistId);
      console.log(`Found ${tracks.length} tracks`);
      tracks.slice(0, 5).forEach((track, index) => {
        console.log(`   ${index + 1}. ${track.name} - ${track.artists}`);
      });
    }

    console.log('\n✅ Spotify integration test completed successfully!');
  } catch (error) {
    console.error('❌ Spotify integration test failed:', error.message);
    console.log('\nMake sure you have:');
    console.log('1. Updated src/config/spotifyConfig.js with your credentials');
    console.log('2. Valid Spotify API credentials');
    console.log('3. Internet connection');
  }
}

// Run the test
testSpotifyIntegration(); 