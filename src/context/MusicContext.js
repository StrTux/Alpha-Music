import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import TrackPlayer, {
  State,
  usePlaybackState,
  RepeatMode,
  Event,
} from 'react-native-track-player';
import apiService from '../services/ApiService';
import {AuthContext} from './AuthContext';
import {mockTracks} from '../utils/mockData';
import {Platform} from 'react-native';
import {resetPlayer} from '../utils/resetPlayer';

export const MusicContext = createContext();

export const MusicProvider = ({children, offlineMode = false}) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [repeatMode, setRepeatMode] = useState(RepeatMode.Off);
  const [isPaused, setIsPaused] = useState(true);
  const [isPlayerError, setIsPlayerError] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const playbackState = usePlaybackState();
  const {userToken} = useContext(AuthContext);

  // Handle player setup issues
  const handlePlayerReset = useCallback(async () => {
    setIsPlayerError(false);
    setError(null);
    await resetPlayer();
    fetchHomeData();
  }, []);

  // Initialize with some trending songs
  useEffect(() => {
    // Even if no userToken, we load content for demo/browsing
    fetchHomeData();

    // Set up an error listener
    const errorListener = TrackPlayer.addEventListener(
      Event.PlaybackError,
      async error => {
        console.error('Playback error in context:', error);
        setIsPlayerError(true);
        setError('Playback error: ' + (error.message || 'Unknown error'));
      },
    );

    return () => {
      errorListener.remove();
    };
  }, [userToken]);

  // Monitor playback state changes
  useEffect(() => {
    if (playbackState?.state === State.Playing) {
      setIsPaused(false);
      setIsPlayerError(false);
    } else if (
      playbackState?.state === State.Paused ||
      playbackState?.state === State.Stopped
    ) {
      setIsPaused(true);
    } else if (playbackState?.state === State.Error) {
      setIsPlayerError(true);
    }
  }, [playbackState]);

  // Track the current track changes
  useEffect(() => {
    const trackChangeListener = async () => {
      try {
        const index = await TrackPlayer.getCurrentTrack().catch(() => null);
        if (index !== null && index !== undefined) {
          const track = await TrackPlayer.getTrack(index).catch(() => null);
          if (track) {
            setCurrentTrack(track);
          }
        }
      } catch (error) {
        console.error('Error getting current track:', error);
      }
    };

    // Call immediately and then set up for subsequent changes
    trackChangeListener();

    // Set up a listener that runs every second to check the current track
    // This ensures the UI stays in sync even if the track changes from external sources
    const intervalId = setInterval(trackChangeListener, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch home data including trending songs, new releases, etc.
  const fetchHomeData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getHomeData();

      if (response.error) {
        setError(response.message || 'Failed to fetch home data');
      } else if (response.data) {
        // Set trending songs from home data
        if (response.data.trending) {
          setTrendingSongs(response.data.trending || []);

          // We no longer add tracks to queue automatically
          // Only add tracks when the user explicitly chooses to play music
        }

        // Set new releases from home data
        if (response.data.newReleases) {
          setNewReleases(response.data.newReleases || []);
        }

        // Set top artists and playlists
        if (response.data.topArtists) {
          setTopArtists(response.data.topArtists || []);
        }

        if (response.data.playlists) {
          setPlaylists(response.data.playlists || []);
        }
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
      setError('Failed to fetch home data');

      // Don't use mock tracks as fallback anymore
      // Let the UI handle the empty state
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format tracks for the player
  const formatTracksForPlayer = songs => {
    if (!songs || !Array.isArray(songs)) {
      console.warn('formatTracksForPlayer received invalid songs:', songs);
      return [];
    }

    return songs
      .map(song => {
        // Ensure required fields exist to prevent crashes
        if (!song) {
          return null;
        }

        // For local files, we need to handle them differently
        let url = song.url;
        if (typeof url === 'number') {
          // This is already a require() result, keep it as is
        } else {
          url = song.downloadUrl || song.url || song.streamingUrl || '';
        }

        return {
          id: song.id || `song-${Math.random().toString(36).substr(2, 9)}`,
          url: url,
          title: song.title || song.name || 'Unknown Title',
          artist: song.artist || song.primaryArtists || 'Unknown Artist',
          artwork:
            song.imageUrl ||
            (Array.isArray(song.image) ? song.image[0] : song.image) ||
            song.artwork ||
            '',
          duration: song.duration || 0,
        };
      })
      .filter(track => track !== null && track.url);
  };

  // Fetch trending songs (renamed from getTrendingSongs to fetchTrendingSongs)
  const fetchTrendingSongs = async () => {
    try {
      setError(null);
      const homeData = await apiService.getHomeData();

      if (homeData.error) {
        console.error('Error fetching trending songs:', homeData.message);
      } else if (homeData.data?.trending) {
        setTrendingSongs(homeData.data.trending || []);
      }
    } catch (error) {
      console.error('Error fetching trending songs:', error);
    }
  };

  // Fetch new releases
  const fetchNewReleases = async () => {
    try {
      setError(null);
      const homeData = await apiService.getHomeData();

      if (homeData.error) {
        console.error('Error fetching new releases:', homeData.message);
      } else if (homeData.data?.newReleases) {
        setNewReleases(homeData.data.newReleases || []);
      }
    } catch (error) {
      console.error('Error fetching new releases:', error);
    }
  };

  // Search songs
  const searchSongs = async query => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.searchSongs(query);

      if (response.error) {
        setError(response.message || 'Failed to search songs');
        setSearchResults([]);
      } else if (response.data) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      setError('Failed to search songs');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Global search (songs, albums, artists)
  const search = async query => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.search(query);

      if (response.error) {
        setError(response.message || 'Failed to search');
        setSearchResults([]);
      } else if (response.data) {
        setSearchResults(response.data || []);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Failed to search');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play/pause toggle
  const togglePlayback = useCallback(async () => {
    try {
      if (isPlayerError) {
        // Try to recover from error
        await handlePlayerReset();
        return;
      }

      const state = await TrackPlayer.getState();

      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setError('Failed to control playback');
    }
  }, [isPlayerError, handlePlayerReset]);

  // Play a specific song
  const playSong = async (song, songList = []) => {
    if (!song) {
      console.warn('playSong called with no song');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      setIsPlayerError(false);

      // Reset the player
      await TrackPlayer.reset();

      // Process URL to ensure proper format
      const processUrl = url => {
        if (!url) {
          return '';
        }

        // Handle number URLs (local files)
        if (typeof url === 'number') {
          return url;
        }

        try {
          // Try to ensure it's a properly formatted URL
          let processedUrl = url;

          // Remove any trailing spaces
          processedUrl = processedUrl.trim();

          // Validate URL formatting with the URL constructor
          try {
            new URL(processedUrl);
            // URL is valid
          } catch (e) {
            // URL might not be valid - try to encode it properly
            processedUrl = encodeURI(processedUrl);
          }

          // Convert HTTP to HTTPS if needed
          if (processedUrl.startsWith('http://')) {
            processedUrl = processedUrl.replace('http://', 'https://');
          }

          // Log the final URL for debugging
          console.log('Processed URL:', processedUrl.substring(0, 50) + '...');

          return processedUrl;
        } catch (e) {
          console.warn('Error processing URL:', e);
          return url; // Return original if processing fails
        }
      };

      // Format the selected song for the player
      const track = {
        id: song.id || `song-${Math.random().toString(36).substr(2, 9)}`,
        url: processUrl(
          song.downloadUrl || song.url || song.streamingUrl || '',
        ),
        title: song.title || song.name || 'Unknown Title',
        artist: song.artist || song.primaryArtists || 'Unknown Artist',
        artwork:
          song.imageUrl ||
          (Array.isArray(song.image)
            ? song.image[song.image.length - 1].link || song.image[0]
            : song.image) ||
          song.artwork ||
          '',
        duration: song.duration || 0,
        playedAt: new Date().toISOString(), // Add timestamp when played
      };

      // Verify URL to prevent crashes
      if (!track.url) {
        console.error('Song has no playable URL:', song);
        setError('This song cannot be played (no URL)');
        setIsLoading(false);
        return;
      }

      console.log(
        'Adding track to player:',
        JSON.stringify({
          id: track.id,
          title: track.title,
          artist: track.artist,
          url: track.url ? track.url.substring(0, 50) + '...' : 'undefined',
        }),
      );

      // Add to recently played
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(item => item.id !== track.id);
        return [track, ...filtered].slice(0, 20); // Keep last 20 tracks
      });

      // Add the selected song
      await TrackPlayer.add(track);
      setCurrentTrack(track);

      // Add the rest of the songs from the list (excluding the current one)
      if (songList && songList.length > 0) {
        const remainingSongs = songList
          .filter(s => s && s.id !== song.id)
          .map(s => ({
            id: s.id || `song-${Math.random().toString(36).substr(2, 9)}`,
            url: processUrl(s.downloadUrl || s.url || s.streamingUrl || ''),
            title: s.title || s.name || 'Unknown Title',
            artist: s.artist || s.primaryArtists || 'Unknown Artist',
            artwork:
              s.imageUrl ||
              (Array.isArray(s.image)
                ? s.image[s.image.length - 1].link || s.image[0]
                : s.image) ||
              s.artwork ||
              '',
            duration: s.duration || 0,
          }))
          .filter(track => track.url); // Only add tracks with valid URLs

        if (remainingSongs.length > 0) {
          await TrackPlayer.add(remainingSongs);
        }

        // Update queue state
        setQueue([track, ...remainingSongs]);
      } else {
        setQueue([track]);
      }

      // Start playback
      await TrackPlayer.play().catch(playError => {
        console.error('Error playing track:', playError);
        setError('Failed to play track. Please try another song.');
        setIsPlayerError(true);
      });
    } catch (error) {
      console.error('Error in playSong:', error);
      setError('Failed to play song');
      setIsPlayerError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Skip to next track
  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.error('Error skipping to next:', error);

      // Recover by trying to play the first track if queue is empty
      try {
        const queueLength = await TrackPlayer.getQueue().then(q => q.length);
        if (queueLength === 0 && trendingSongs.length > 0) {
          playSong(trendingSongs[0], trendingSongs);
        }
      } catch (recoveryError) {
        console.error('Error recovering from skip next:', recoveryError);
      }
    }
  };

  // Skip to previous track
  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.error('Error skipping to previous:', error);

      // Recover by trying to play the last track if queue is empty
      try {
        const queueLength = await TrackPlayer.getQueue().then(q => q.length);
        if (queueLength === 0 && trendingSongs.length > 0) {
          playSong(trendingSongs[trendingSongs.length - 1], trendingSongs);
        }
      } catch (recoveryError) {
        console.error('Error recovering from skip previous:', recoveryError);
      }
    }
  };

  // Toggle repeat mode
  const toggleRepeatMode = async () => {
    try {
      let newMode;

      if (repeatMode === RepeatMode.Off) {
        newMode = RepeatMode.Queue;
      } else if (repeatMode === RepeatMode.Queue) {
        newMode = RepeatMode.Track;
      } else {
        newMode = RepeatMode.Off;
      }

      await TrackPlayer.setRepeatMode(newMode);
      setRepeatMode(newMode);
    } catch (error) {
      console.error('Error toggling repeat mode:', error);
    }
  };

  // Shuffle the queue
  const shuffleQueue = async () => {
    try {
      setError(null);
      const currentQueue = await TrackPlayer.getQueue();
      if (currentQueue.length <= 1) {
        return;
      }

      // Get current track
      const currentTrackIndex = await TrackPlayer.getCurrentTrack();
      const currentTrack = currentQueue[currentTrackIndex];

      // Remove current track from shuffle and shuffle remaining tracks
      const tracksToShuffle = currentQueue.filter(
        (_, index) => index !== currentTrackIndex,
      );
      const shuffledTracks = [...tracksToShuffle].sort(
        () => Math.random() - 0.5,
      );

      // Reset and add current track first, then shuffled tracks
      await TrackPlayer.reset();
      await TrackPlayer.add([currentTrack, ...shuffledTracks]);
      setQueue([currentTrack, ...shuffledTracks]);
    } catch (shuffleError) {
      console.error('Error shuffling queue:', shuffleError);
      setError('Failed to shuffle queue');
    }
  };

  // Get track metadata by its ID
  const getTrackInfo = async trackId => {
    try {
      return await apiService.getSongDetails(trackId);
    } catch (infoError) {
      console.error('Error getting track info:', infoError);
      return null;
    }
  };

  // Check if API is using mock data
  const checkApiStatus = () => {
    return apiService.isUsingMockData()
      ? 'Using offline mock data'
      : 'Connected to music API';
  };

  // Get user playlists
  const getUserPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would be fetched from an API using the user token
      // For now, we'll return mock data
      const mockPlaylists = [
        {
          id: 'playlist-1',
          name: 'My Favorite Songs',
          imageUrl:
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200',
          songCount: 24,
        },
        {
          id: 'playlist-2',
          name: 'Workout Mix',
          imageUrl:
            'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=200',
          songCount: 18,
        },
      ];

      return mockPlaylists;
    } catch (playlistError) {
      console.error('Error fetching user playlists:', playlistError);
      setError('Failed to fetch user playlists');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user liked songs
  const getLikedSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would be fetched from an API using the user token
      // For now, we'll return mock data
      const mockLikedSongs = [
        {
          id: 'song-1',
          title: 'Liked Song 1',
          artist: 'Artist 1',
          artwork:
            'https://images.unsplash.com/photo-1584679109597-c656b19974c9?w=200',
        },
        {
          id: 'song-2',
          title: 'Liked Song 2',
          artist: 'Artist 2',
          artwork:
            'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200',
        },
      ];

      return mockLikedSongs;
    } catch (error) {
      console.error('Error fetching liked songs:', error);
      setError('Failed to fetch liked songs');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get user saved albums
  const getSavedAlbums = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would be fetched from an API using the user token
      // For now, we'll return mock data
      const mockSavedAlbums = [
        {
          id: 'album-1',
          name: 'Saved Album 1',
          artist: 'Artist 1',
          imageUrl:
            'https://images.unsplash.com/photo-1463947628408-f8581a2f4aca?w=200',
        },
        {
          id: 'album-2',
          name: 'Saved Album 2',
          artist: 'Artist 2',
          imageUrl:
            'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200',
        },
      ];

      return mockSavedAlbums;
    } catch (error) {
      console.error('Error fetching saved albums:', error);
      setError('Failed to fetch saved albums');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Return the context provider with all values
  return (
    <MusicContext.Provider
      value={{
        currentTrack,
        queue,
        isLoading,
        searchResults,
        trendingSongs,
        newReleases,
        topArtists,
        playlists,
        error,
        repeatMode,
        isPaused,
        isPlayerError,
        recentlyPlayed,
        playbackState,
        handlePlayerReset,
        fetchHomeData,
        fetchTrendingSongs,
        shuffleQueue,
        getTrackInfo,
        checkApiStatus,
        getUserPlaylists,
        offlineMode,
      }}>
      {children}
    </MusicContext.Provider>
  );
};

// Custom hook to use the music context
export const useMusic = () => useContext(MusicContext);
