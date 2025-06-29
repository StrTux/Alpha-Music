// Spotify API Configuration
// This file now uses environment variables from .env file
// Make sure to create a .env file in your project root with:
// SPOTIFY_CLIENT_ID=your_actual_client_id
// SPOTIFY_CLIENT_SECRET=your_actual_client_secret

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';

export const SPOTIFY_CONFIG = {
  CLIENT_ID: SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: SPOTIFY_CLIENT_SECRET,
};

// Instructions to get Spotify API credentials:
// 1. Go to https://developer.spotify.com/dashboard
// 2. Log in with your Spotify account
// 3. Click "Create App"
// 4. Fill in the app details (name, description, etc.)
// 5. Once created, you'll see your Client ID and Client Secret
// 6. Create a .env file in your project root and add:
//    SPOTIFY_CLIENT_ID=your_actual_client_id
//    SPOTIFY_CLIENT_SECRET=your_actual_client_secret 