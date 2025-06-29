// Spotify Service for React Native
// This service handles Spotify API calls for playlist search and track fetching

import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '@env';
import base64 from 'react-native-base64';

class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get Spotify access token
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = base64.encode(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      const data = await response.json();
      
      if (!data.access_token) {
        throw new Error('Failed to get Spotify token: ' + JSON.stringify(data));
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error getting Spotify token:', error);
      throw error;
    }
  }

  // Search Spotify playlists
  async searchPlaylists(query, limit = 5) {
    try {
      const token = await this.getAccessToken();
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&limit=${limit}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      const playlists = (data.playlists?.items || []).filter(Boolean);

      return playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        title: playlist.name,
        owner: playlist.owner?.display_name,
        image: playlist.images?.[0]?.url,
        url: playlist.external_urls?.spotify,
        spotify_id: playlist.id,
        type: 'playlist',
        spotify_playlist: true
      }));
    } catch (error) {
      console.error('Error searching Spotify playlists:', error);
      return [];
    }
  }

  // Get all tracks from a Spotify playlist
  async getPlaylistTracks(playlistId) {
    try {
      const token = await this.getAccessToken();
      let allTracks = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        const items = data.items?.filter(item => item.track) || [];

        allTracks.push(...items);

        if (items.length < limit) break;
        offset += limit;
      }

      return allTracks.map(item => ({
        id: item.track.id,
        name: item.track.name,
        artists: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album?.name,
        image: item.track.album?.images?.[0]?.url,
        duration: item.track.duration_ms,
        spotify_id: item.track.id
      }));
    } catch (error) {
      console.error('Error getting playlist tracks:', error);
      return [];
    }
  }

  // Get playlist details
  async getPlaylistDetails(playlistId) {
    try {
      const token = await this.getAccessToken();
      const url = `https://api.spotify.com/v1/playlists/${playlistId}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const playlist = await response.json();
      
      return {
        id: playlist.id,
        name: playlist.name,
        title: playlist.name,
        owner: playlist.owner?.display_name,
        image: playlist.images?.[0]?.url,
        url: playlist.external_urls?.spotify,
        description: playlist.description,
        total_tracks: playlist.tracks?.total,
        spotify_id: playlist.id
      };
    } catch (error) {
      console.error('Error getting playlist details:', error);
      return null;
    }
  }
}

export default new SpotifyService(); 