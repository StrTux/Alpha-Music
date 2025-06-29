import { SPOTIFY_CONFIG } from '../config/spotifyConfig';

/**
 * Get Spotify access token
 * @returns {Promise<string>} - Access token
 */
async function getSpotifyToken() {
  if (!SPOTIFY_CONFIG.CLIENT_ID || !SPOTIFY_CONFIG.CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured');
  }

  try {
    const { getSpotifyToken: getToken } = require('./getSpotifyToken');
    return await getToken(SPOTIFY_CONFIG.CLIENT_ID, SPOTIFY_CONFIG.CLIENT_SECRET);
  } catch (error) {
    throw error;
  }
}

/**
 * Search for an artist by name and get their Spotify ID
 * @param {string} artistName - The name of the artist to search for
 * @returns {Promise<Object|null>} - Artist object or null if not found
 */
export async function searchArtistByName(artistName) {
  if (!artistName || artistName.trim() === '') {
    return null;
  }
  
  try {
    const token = await getSpotifyToken();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1&market=IN`;
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const artists = data.artists?.items || [];

    if (artists.length === 0) {
      return null;
    }

    const artist = artists[0];
    return artist;

  } catch (error) {
    return null;
  }
}

/**
 * Get Spotify catalog information for a single artist by ID
 * @param {string} artistId - The Spotify ID of the artist
 * @returns {Promise<Object|null>} - Artist details or null if not found
 */
export async function getArtistDetails(artistId) {
  if (!artistId) {
    return null;
  }
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const artist = await response.json();
    return artist;

  } catch (error) {
    return null;
  }
}

/**
 * Get Spotify catalog information for several artists by IDs
 * @param {Array<string>} artistIds - Array of Spotify artist IDs (max 50)
 * @returns {Promise<Array>} - Array of artist objects
 */
export async function getMultipleArtists(artistIds) {
  if (!artistIds || artistIds.length === 0) {
    return [];
  }
  
  if (artistIds.length > 50) {
    artistIds = artistIds.slice(0, 50);
  }
  
  try {
    const token = await getSpotifyToken();
    const ids = artistIds.join(',');
    const url = `https://api.spotify.com/v1/artists?ids=${ids}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const artists = data.artists || [];
    return artists;

  } catch (error) {
    return [];
  }
}

/**
 * Get Spotify catalog information about an artist's albums
 * @param {string} artistId - The Spotify ID of the artist
 * @param {Object} options - Options for album fetching
 * @param {string} options.includeGroups - Comma-separated list: album,single,appears_on,compilation
 * @param {string} options.market - ISO 3166-1 alpha-2 country code (default: IN)
 * @param {number} options.limit - Maximum number of items (default: 20, max: 50)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @returns {Promise<Object>} - Albums response with pagination
 */
export async function getArtistAlbums(artistId, options = {}) {
  if (!artistId) {
    return null;
  }
  
  const {
    includeGroups = 'album,single',
    market = 'IN',
    limit = 20,
    offset = 0
  } = options;
  
  try {
    const token = await getSpotifyToken();
    const params = new URLSearchParams({
      include_groups: includeGroups,
      market: market,
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    const url = `https://api.spotify.com/v1/artists/${artistId}/albums?${params}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    return null;
  }
}

/**
 * Get Spotify catalog information about an artist's top tracks by country
 * @param {string} artistId - The Spotify ID of the artist
 * @param {string} market - ISO 3166-1 alpha-2 country code (default: IN)
 * @returns {Promise<Array>} - Array of top track objects
 */
export async function getArtistTopTracksById(artistId, market = 'IN') {
  if (!artistId) {
    return [];
  }
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const tracks = data.tracks || [];

    // Format tracks for our app
    const formattedTracks = tracks.map(track => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      duration: track.duration_ms,
      image: track.album.images[0]?.url,
      spotify_id: track.id,
      source: 'spotify',
      popularity: track.popularity,
      preview_url: track.preview_url,
      external_urls: track.external_urls
    }));    
    return formattedTracks;

  } catch (error) {
    return [];
  }
}

/**
 * Search for an artist by name and fetch their top tracks (market=IN)
 * @param {string} artistName - The name of the artist to search for
 * @returns {Promise<Array>} - Array of top track objects
 */
export async function getArtistTopTracks(artistName) {
  if (!artistName || artistName.trim() === '') {
    return [];
  }
  
  try {
    // First, search for the artist to get their ID
    const artist = await searchArtistByName(artistName);
    if (!artist) {
      return [];
    }

    // Then get their top tracks
    const tracks = await getArtistTopTracksById(artist.id, 'IN');
    return tracks;

  } catch (error) {
    return [];
  }
}

/**
 * Get Spotify catalog information about artists similar to a given artist
 * @param {string} artistId - The Spotify ID of the artist
 * @returns {Promise<Array>} - Array of related artist objects
 */
export async function getRelatedArtists(artistId) {
  if (!artistId) {
    return [];
  }
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const artists = data.artists || [];
    return artists;

  } catch (error) {
    return [];
  }
}

/**
 * Comprehensive artist search and data fetching
 * @param {string} artistName - The name of the artist to search for
 * @returns {Promise<Object>} - Complete artist data including details and top tracks
 */
export async function getCompleteArtistData(artistName) {
  if (!artistName || artistName.trim() === '') {
    return null;
  }
  
  try {
    // Search for artist
    const artist = await searchArtistByName(artistName);
    if (!artist) {
      return null;
    }

    // Get all data in parallel
    const [details, topTracks, relatedArtists] = await Promise.allSettled([
      getArtistDetails(artist.id),
      getArtistTopTracksById(artist.id, 'IN'),
      getRelatedArtists(artist.id)
    ]);

    const result = {
      artist: artist,
      details: details.status === 'fulfilled' ? details.value : null,
      topTracks: topTracks.status === 'fulfilled' ? topTracks.value : [],
      relatedArtists: relatedArtists.status === 'fulfilled' ? relatedArtists.value : []
    };

    return result;

  } catch (error) {
    return null;
  }
}

// Test function for development
export async function testArtistSearch() {
  try {
    const arijitTracks = await getArtistTopTracks('arijit singh');
    const honeyTracks = await getArtistTopTracks('honey singh');
    return { arijitTracks, honeyTracks };
  } catch (error) {
    throw error;
  }
}