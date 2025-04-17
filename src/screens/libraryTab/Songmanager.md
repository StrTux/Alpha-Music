import apiService from '../../Service';
import { Platform } from 'react-native';

// Fallback songs to use when API fails
export const fallbackSongs = [
  {
    id: '1',
    title: 'Thunderclouds',
    artist: 'LSD, Sia, Diplo, Labrinth',
    image: { uri: 'http://c.saavncdn.com/679/Thunderclouds-English-2018-20180809032729-500x500.jpg' },
    url: 'http://preview.saavncdn.com/679/6hiekPqnKvxKey2mNNO3fNk8NrPXHqyAfolWfOZ_96_p.mp4',
    artwork: 'http://c.saavncdn.com/679/Thunderclouds-English-2018-20180809032729-500x500.jpg',
    duration: 187,
    album: 'Thunderclouds',
    albumId: '13615087',
  },
  {
    id: '2',
    title: 'Radioactive',
    artist: 'Imagine Dragons',
    image: { uri: 'http://c.saavncdn.com/210/Night-Visions-2013-500x500.jpg' },
    url: 'http://aac.saavncdn.com/210/a6592cefb1b57cf146cf811a747223b4_320.mp4',
    artwork: 'http://c.saavncdn.com/210/Night-Visions-2013-500x500.jpg',
    duration: 187,
    album: 'Night Visions',
    albumId: '1142502',
  },
];

// Validate URL to make sure it's a valid URI
const validateUrl = (url) => {
  if (!url) return null;
  
  try {
    // Clean the URL if needed
    let cleanUrl = url;
    
    // Handle different URL formats
    if (typeof url === 'string') {
      cleanUrl = url.trim();
      
      // Check if it's a valid URL pattern
      if (!cleanUrl.match(/^(http|https):\/\//)) {
        console.warn('Invalid URL format:', url);
        return null;
      }
      
      // Handle special characters in URLs
      cleanUrl = cleanUrl.replace(/\s/g, '%20');
    } else if (typeof url === 'object' && url.uri) {
      // Handle require() format
      return url;
    } else {
      console.warn('Unsupported URL format:', url);
      return null;
    }
    
    return cleanUrl;
  } catch (error) {
    console.error('Error validating URL:', error, url);
    return null;
  }
};

// Helper function to convert API song data to app format
export const convertSongData = (song) => {
  try {
    if (!song) return null;
    
    // Handle JioSaavn API format
    if (song.id) {
      // Extract the image URL
      let imageUrl = '';
      if (Array.isArray(song.image)) {
        // Find highest quality image
        const highQualityImg = song.image.find(img => img?.quality === '500x500' || img?.link?.includes('500x500'));
        const mediumQualityImg = song.image.find(img => img?.quality === '150x150' || img?.link?.includes('150x150'));
        imageUrl = highQualityImg?.link || mediumQualityImg?.link || song.image[0]?.link;
      } else if (typeof song.image === 'string') {
        imageUrl = song.image;
      } else if (song.image && song.image.uri) {
        imageUrl = song.image.uri;
      }
      
      // Validate image URL
      const validImageUrl = validateUrl(imageUrl) || 'https://via.placeholder.com/500';
      
      // Extract download/streaming URL
      let audioUrl = '';
      if (song.streamingUrl) {
        audioUrl = song.streamingUrl;
      } else if (Array.isArray(song.downloadUrl)) {
        // Try to get high quality version first
        if (typeof song.downloadUrl[0] === 'object') {
          const highQuality = song.downloadUrl.find(url => url?.quality === '320kbps' || url?.quality === '160kbps');
          audioUrl = highQuality?.link || song.downloadUrl[0]?.link;
        } else {
          audioUrl = song.downloadUrl[0];
        }
      } else if (typeof song.downloadUrl === 'string') {
        audioUrl = song.downloadUrl;
      } else if (song.url) {
        audioUrl = song.url;
      }
      
      // Validate audio URL
      const validAudioUrl = validateUrl(audioUrl);
      if (!validAudioUrl) {
        console.warn('Invalid audio URL for song:', song.id, song.name || song.title);
        return null;
      }
      
      // Handle artists
      let artist = '';
      if (song.primaryArtists) {
        artist = song.primaryArtists;
      } else if (song.artist) {
        artist = song.artist;
      } else if (song.artists && Array.isArray(song.artists)) {
        artist = song.artists.join(', ');
      } else if (song.artist_map && song.artist_map.primary_artists) {
        artist = song.artist_map.primary_artists.map(a => a.name).join(', ');
      } else {
        artist = 'Unknown Artist';
      }
      
      const songData = {
        id: song.id,
        title: song.name || song.title || 'Unknown Title',
        artist: artist,
        image: typeof validImageUrl === 'string' ? { uri: validImageUrl } : validImageUrl,
        url: validAudioUrl,
        artwork: typeof validImageUrl === 'string' ? validImageUrl : (validImageUrl.uri || 'https://via.placeholder.com/500'),
        duration: parseInt(song.duration) || 0,
        album: song.album?.name || song.albumName || 'Unknown Album',
        albumId: song.album?.id || song.albumId,
      };
      
      return songData;
    }
    
    return null;
  } catch (error) {
    console.error('Error converting song data:', error, song);
    return null;
  }
};

// Fetch trending songs from the API
export const fetchTrendingSongs = async (limit = 20) => {
  try {
    console.log('Fetching trending songs...');
    const response = await apiService.getTrendingSongs(limit);
    
    if (!response) {
      console.error('No response from trending songs API');
      return fallbackSongs;
    }
    
    if (response.error) {
      console.error('API error in trending songs:', response.message);
      return fallbackSongs;
    }
    
    // Map the response to our app's song format
    if (response.data && response.data.length > 0) {
      console.log(`Got ${response.data.length} trending songs`);
      
      const convertedSongs = response.data
        .map((song, index) => {
          try {
            const converted = convertSongData(song);
            if (converted) {
              return {
                ...converted,
                id: `trending_${index + 1}`, // Ensure sequential IDs for track player with prefix to avoid collisions
              };
            }
            return null;
          } catch (error) {
            console.error('Error converting individual song:', error);
            return null;
          }
        })
        .filter(song => song !== null && song.url); // Only include songs with valid URLs
      
      if (convertedSongs.length > 0) {
        return convertedSongs;
      } else {
        console.warn('No valid songs found in API response, using fallback songs');
        return fallbackSongs;
      }
    }
    
    console.log('No trending songs found in response, using fallback songs');
    return fallbackSongs;
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return fallbackSongs;
  }
};

// Fetch new releases
export const fetchNewReleases = async (limit = 20) => {
  try {
    console.log('Fetching new releases...');
    const response = await apiService.getNewReleases(limit);
    
    if (!response) {
      console.error('No response from new releases API');
      return fallbackSongs;
    }
    
    if (response.error) {
      console.error('API error in new releases:', response.message);
      return fallbackSongs;
    }
    
    // Map the response to our app's song format
    if (response.data && response.data.albums) {
      console.log(`Got ${response.data.albums.length} albums in new releases`);
      
      // For albums, we need to get the album details to get songs
      const albumPromises = response.data.albums.slice(0, limit).map(album => 
        apiService.getAlbumDetails(album.id)
          .catch(err => {
            console.error(`Error fetching album ${album.id}:`, err);
            return { data: null };
          })
      );
      
      let albumsData = [];
      try {
        albumsData = await Promise.all(albumPromises);
      } catch (error) {
        console.error('Error in Promise.all for album details:', error);
        return fallbackSongs;
      }
      
      // Extract songs from albums
      let songs = [];
      albumsData.forEach(albumResponse => {
        try {
          if (albumResponse && albumResponse.data && albumResponse.data.songs) {
            songs = [...songs, ...albumResponse.data.songs];
          }
        } catch (error) {
          console.error('Error processing album data:', error);
        }
      });
      
      console.log(`Got ${songs.length} songs from new releases albums`);
      
      // Map songs to our format
      const convertedSongs = songs
        .map((song, index) => {
          try {
            const converted = convertSongData(song);
            if (converted) {
              return {
                ...converted,
                id: `new_${index + 1}`, // Ensure sequential IDs for track player with prefix to avoid collisions
              };
            }
            return null;
          } catch (error) {
            console.error('Error converting individual song:', error);
            return null;
          }
        })
        .filter(song => song !== null && song.url);
      
      if (convertedSongs.length > 0) {
        return convertedSongs;
      } else {
        console.warn('No valid songs found in new releases, using fallback songs');
        return fallbackSongs;
      }
    }
    
    console.log('No albums found in new releases response, using fallback songs');
    return fallbackSongs;
  } catch (error) {
    console.error('Error fetching new releases:', error);
    return fallbackSongs;
  }
};

// Search songs by query
export const searchSongsByQuery = async (query, limit = 20) => {
  try {
    if (!query || query.trim() === '') {
      return [];
    }
    
    console.log(`Searching songs with query: "${query}"`);
    const response = await apiService.searchSongs(query, limit);
    
    if (!response) {
      console.error('No response from search API');
      return [];
    }
    
    if (response.error) {
      console.error('API error in search:', response.message);
      return [];
    }
    
    // Map the response to our app's song format
    if (response.data && response.data.results) {
      console.log(`Got ${response.data.results.length} search results`);
      
      const convertedSongs = response.data.results
        .map((song, index) => {
          try {
            const converted = convertSongData(song);
            if (converted) {
              return {
                ...converted,
                id: `search_${index + 1}`, // Ensure sequential IDs for track player with prefix to avoid collisions
              };
            }
            return null;
          } catch (error) {
            console.error('Error converting individual search result:', error);
            return null;
          }
        })
        .filter(song => song !== null && song.url);
      
      return convertedSongs;
    }
    
    console.log('No results found in search response');
    return [];
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

// Get song recommendations
export const getSongRecommendations = async (songId, limit = 10) => {
  try {
    const response = await apiService.getSongRecommendations(songId, limit);
    if (!response || response.error) {
      console.warn('Error getting recommendations, returning fallback songs');
      return fallbackSongs;
    }
    
    // Map the response to our app's song format
    if (response.data && response.data.length > 0) {
      const convertedSongs = response.data
        .map((song, index) => {
          try {
            const converted = convertSongData(song);
            if (converted) {
              return {
                ...converted,
                id: `rec_${index + 1}`, // Ensure sequential IDs for track player with prefix to avoid collisions
              };
            }
            return null;
          } catch (error) {
            console.error('Error converting individual recommendation:', error);
            return null;
          }
        })
        .filter(song => song !== null && song.url);
        
      if (convertedSongs.length > 0) {
        return convertedSongs;
      }
    }
    
    return fallbackSongs;
  } catch (error) {
    console.error('Error fetching song recommendations:', error);
    return fallbackSongs;
  }
}; 