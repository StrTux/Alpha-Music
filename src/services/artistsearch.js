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
    console.error('Error getting Spotify token:', error);
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
    console.warn('Artist name is empty. Skipping search.');
    return null;
  }
  
  console.log(`🔍 Searching Spotify for artist: "${artistName}"`);
  
  try {
    const token = await getSpotifyToken();
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1&market=IN`;
    
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Artist search failed: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const artists = data.artists?.items || [];

    if (artists.length === 0) {
      console.log(`❌ No artist found for: "${artistName}"`);
      return null;
    }

    const artist = artists[0];
    console.log(`✅ Found artist: ${artist.name} (ID: ${artist.id})`);
    return artist;

  } catch (error) {
    console.error('❌ Error searching artist:', error.message);
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
    console.warn('Artist ID is required');
    return null;
  }
  
  console.log(`🎵 Getting artist details for ID: ${artistId}`);
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Artist details fetch failed: ${response.status} - ${response.statusText}`);
      return null;
    }

    const artist = await response.json();
    console.log(`✅ Got artist details: ${artist.name}`);
    return artist;

  } catch (error) {
    console.error('❌ Error getting artist details:', error.message);
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
    console.warn('Artist IDs array is required');
    return [];
  }
  
  if (artistIds.length > 50) {
    console.warn('Maximum 50 artist IDs allowed. Truncating to first 50.');
    artistIds = artistIds.slice(0, 50);
  }
  
  console.log(`🎵 Getting details for ${artistIds.length} artists`);
  
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
      console.error(`Multiple artists fetch failed: ${response.status} - ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const artists = data.artists || [];
    console.log(`✅ Got details for ${artists.length} artists`);
    return artists;

  } catch (error) {
    console.error('❌ Error getting multiple artists:', error.message);
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
    console.warn('Artist ID is required');
    return null;
  }
  
  const {
    includeGroups = 'album,single',
    market = 'IN',
    limit = 20,
    offset = 0
  } = options;
  
  console.log(`🎵 Getting albums for artist ID: ${artistId}`);
  
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
      console.error(`Artist albums fetch failed: ${response.status} - ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    console.log(`✅ Got ${data.items.length} albums (total: ${data.total})`);
    return data;

  } catch (error) {
    console.error('❌ Error getting artist albums:', error.message);
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
    console.warn('Artist ID is required');
    return [];
  }
  
  console.log(`🎵 Getting top tracks for artist ID: ${artistId} (market: ${market})`);
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Top tracks fetch failed: ${response.status} - ${response.statusText}`);
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

    console.log(`✅ Found ${formattedTracks.length} top tracks`);
    
    // Log first few tracks for debugging
    if (formattedTracks.length > 0) {
      console.log('📝 Sample tracks:');
      formattedTracks.slice(0, 3).forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.name} - ${track.artists} (Popularity: ${track.popularity})`);
      });
    }
    
    return formattedTracks;

  } catch (error) {
    console.error('❌ Error getting artist top tracks:', error.message);
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
    console.warn('Artist name is empty. Skipping search.');
    return [];
  }
  
  console.log(`🎵 Searching Spotify for artist: "${artistName}"`);
  
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
    console.error('❌ Error fetching artist tracks:', error.message);
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
    console.warn('Artist ID is required');
    return [];
  }
  
  console.log(`🎵 Getting related artists for ID: ${artistId}`);
  
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Related artists fetch failed: ${response.status} - ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const artists = data.artists || [];
    console.log(`✅ Found ${artists.length} related artists`);
    return artists;

  } catch (error) {
    console.error('❌ Error getting related artists:', error.message);
    return [];
  }
}

/**
 * Comprehensive artist search and data fetching
 * @param {string} artistName - The name of the artist to search for
 * @returns {Promise<Object>} - Complete artist data including details, albums, top tracks, and related artists
 */
export async function getCompleteArtistData(artistName) {
  if (!artistName || artistName.trim() === '') {
    console.warn('Artist name is empty. Skipping search.');
    return null;
  }
  
  console.log(`🎵 Getting complete data for artist: "${artistName}"`);
  
  try {
    // Search for artist
    const artist = await searchArtistByName(artistName);
    if (!artist) {
      return null;
    }

    // Get all data in parallel
    const [details, albums, topTracks, relatedArtists] = await Promise.allSettled([
      getArtistDetails(artist.id),
      getArtistAlbums(artist.id, { limit: 20 }),
      getArtistTopTracksById(artist.id, 'IN'),
      getRelatedArtists(artist.id)
    ]);

    const result = {
      artist: artist,
      details: details.status === 'fulfilled' ? details.value : null,
      albums: albums.status === 'fulfilled' ? albums.value : null,
      topTracks: topTracks.status === 'fulfilled' ? topTracks.value : [],
      relatedArtists: relatedArtists.status === 'fulfilled' ? relatedArtists.value : []
    };

    console.log(`✅ Complete data fetched for ${artist.name}:`);
    console.log(`  - Details: ${result.details ? '✅' : '❌'}`);
    console.log(`  - Albums: ${result.albums ? result.albums.items.length : 0} albums`);
    console.log(`  - Top Tracks: ${result.topTracks.length} tracks`);
    console.log(`  - Related Artists: ${result.relatedArtists.length} artists`);

    return result;

  } catch (error) {
    console.error('❌ Error getting complete artist data:', error.message);
    return null;
  }
}

// Test function for development
export async function testArtistSearch() {
  try {
    console.log('🧪 Testing artist search functionality...\n');
    
    console.log('Testing Arijit Singh...');
    const arijitTracks = await getArtistTopTracks('arijit singh');
    console.log(`📊 Arijit Singh tracks: ${arijitTracks.length}`);
    
    if (arijitTracks.length > 0) {
      console.log('📝 Sample tracks:');
      arijitTracks.slice(0, 3).forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.name} - ${track.artists} (Popularity: ${track.popularity})`);
      });
    }
    
    console.log('\nTesting Honey Singh...');
    const honeyTracks = await getArtistTopTracks('honey singh');
    console.log(`📊 Honey Singh tracks: ${honeyTracks.length}`);
    
    if (honeyTracks.length > 0) {
      console.log('📝 Sample tracks:');
      honeyTracks.slice(0, 3).forEach((track, index) => {
        console.log(`  ${index + 1}. ${track.name} - ${track.artists} (Popularity: ${track.popularity})`);
      });
    }
    
    console.log('\n🎉 Test completed successfully!');
    return { arijitTracks, honeyTracks };
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}