import base64 from 'react-native-base64';
import { SPOTIFY_CONFIG } from '../config/spotifyConfig';

export async function getSpotifyToken(clientId = SPOTIFY_CONFIG.CLIENT_ID, clientSecret = SPOTIFY_CONFIG.CLIENT_SECRET) {
  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured. Please check your spotifyConfig.js file.');
  }

  try {
    const credentials = base64.encode(`${clientId}:${clientSecret}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
}
