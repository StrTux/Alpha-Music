# Spotify Integration Setup Guide

## Overview
This guide will help you set up Spotify playlist search and playback in your React Native music app.

## Features
- Search Spotify playlists alongside JioSaavn content
- View Spotify playlist details and tracks
- Play tracks through JioSaavn (when available)
- Fallback to Spotify-only tracks with proper indication

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Alpha Music (or your preferred name)
   - **App description**: Music streaming app with Spotify integration
   - **Website**: Your website URL (optional)
   - **Redirect URI**: Leave empty for now
5. Accept the terms and click "Save"
6. You'll see your **Client ID** and **Client Secret**

### 2. Configure the App

1. Open `src/config/spotifyConfig.js`
2. Replace the placeholder values with your actual credentials:
   ```javascript
   export const SPOTIFY_CONFIG = {
     CLIENT_ID: 'your_actual_client_id_here',
     CLIENT_SECRET: 'your_actual_client_secret_here',
   };
   ```

### 3. Test the Integration

1. Run your React Native app
2. Go to the Search tab
3. Search for "arjit singh" or any artist name
4. You should see Spotify playlists appear in the results with a green Spotify icon
5. Tap on a Spotify playlist to view its tracks
6. Tap on any track to play it (if available on JioSaavn)

## How It Works

### Search Flow
1. User searches for content
2. App searches both JioSaavn and Spotify simultaneously
3. Results are combined and displayed
4. Spotify playlists are marked with a green Spotify icon

### Playlist Flow
1. User taps on a Spotify playlist
2. App fetches all tracks from the Spotify playlist
3. For each track, app searches JioSaavn for streaming data
4. If found on JioSaavn, track can be played
5. If not found, track is marked as "Spotify only"

### Playback Flow
1. User taps on a track
2. If track is available on JioSaavn, it plays through your VLC player
3. If track is Spotify-only, user gets a message to use Spotify app

## File Structure

```
src/
├── config/
│   └── spotifyConfig.js          # Spotify API credentials
├── services/
│   └── SpotifyService.js         # Spotify API service
├── screens/
│   ├── search/
│   │   └── SearchScreen.js       # Updated search with Spotify
│   └── SpotifyPlaylistScreen.js  # Spotify playlist view
└── navigation/
    └── AppNav.js                 # Updated navigation
```

## Troubleshooting

### No Spotify Results
- Check your API credentials in `spotifyConfig.js`
- Verify your Spotify app is properly configured
- Check console logs for API errors

### Playlist Not Loading
- Ensure you have a stable internet connection
- Check if the playlist ID is valid
- Verify the playlist is public

### Tracks Not Playing
- Some tracks may only be available on Spotify
- Check if the track exists on JioSaavn
- Verify your JioSaavn API is working

## Security Notes

- Never commit your actual Spotify credentials to version control
- Consider using environment variables for production
- The current setup uses client credentials flow (no user authentication)

## Future Enhancements

- User authentication for private playlists
- Direct Spotify playback (requires Spotify SDK)
- Playlist creation and management
- Offline playlist caching 