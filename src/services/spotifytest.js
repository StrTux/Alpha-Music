import { SPOTIFY_CONFIG } from '../config/spotifyConfig';

async function testSpotifyAPI() {
  const clientId = SPOTIFY_CONFIG.CLIENT_ID;
  const clientSecret = SPOTIFY_CONFIG.CLIENT_SECRET;
  
  // Get token using the existing getSpotifyToken function
  const { getSpotifyToken } = require('./getSpotifyToken');
  const token = await getSpotifyToken(clientId, clientSecret);

  console.log('Spotify Token:', token);

  // Test search
  const searchUrl = 'https://api.spotify.com/v1/search?q=top%20playlist%20100&type=playlist&limit=5';
  const searchResponse = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!searchResponse.ok) {
    throw new Error(`Search failed: ${searchResponse.status}`);
  }

  const searchData = await searchResponse.json();
  console.log('Search Results:', JSON.stringify(searchData, null, 2));

  return searchData;
}

export { testSpotifyAPI };
