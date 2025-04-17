/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useMemo, useEffect, useContext} from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Appearance,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import TrackPlayer, {
  State,
  usePlaybackState,
  useProgress,
  Event,
  useTrackPlayerEvents,
  RepeatMode,
} from 'react-native-track-player';
import BottomSheet from '@gorhom/bottom-sheet';
import {libraryUI} from '../../styles/Styles';
import {dmLibraryUI} from '../../styles/DarkMode';
import {musicPlayerUI} from '../../styles/Styles';
import {dmPlayerUI} from '../../styles/DarkMode';
import {
  fallbackSongs,
  fetchTrendingSongs,
  searchSongsByQuery,
} from './SongManager';
import Controller from '../playerTab/Controller';
import Slider from '@react-native-community/slider';
import VolumeSlider from '../playerTab/VolumeSlider';
import {AuthContext} from '../../context/AuthContext';
import {useSafeDataFetching} from '../../utils/useSingleEffect';

const formatTime = secs => {
  let minutes = Math.floor(secs / 60);
  let seconds = Math.ceil(secs - minutes * 60);

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  return `${minutes}:${seconds}`;
};

// Events to listen for
const events = [
  Event.PlaybackError,
  Event.PlaybackState,
  Event.PlaybackTrackChanged,
];

const Library = () => {
  const navigation = useNavigation();
  const playbackState = usePlaybackState();
  const [searchQuery, setSearchQuery] = useState('');
  const [songIndex, setSongIndex] = useState(0);
  const [theme, setTheme] = useState(Appearance.getColorScheme());
  const {position, duration} = useProgress();
  const bottomSheetRef = useRef(null);
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [useBottomSheet, setUseBottomSheet] = useState(false);
  const [playerSetupAttempted, setPlayerSetupAttempted] = useState(false);
  const [playerSetupComplete, setPlayerSetupComplete] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const {networkConnected} = useContext(AuthContext);

  // Listen for track player events
  useTrackPlayerEvents(events, async event => {
    try {
      if (event.type === Event.PlaybackError) {
        console.error('Playback error:', event.message);
        setPlaybackError(event.message);

        // Show error to user
        Alert.alert(
          'Playback Error',
          `There was an error playing this song: ${event.message}`,
          [{text: 'OK'}],
        );

        // Try to recover automatically - skip to next song
        try {
          if (songIndex < songs.length - 1) {
            await next();
          }
        } catch (recoverError) {
          console.error('Failed to recover from playback error:', recoverError);
        }
      }

      if (event.type === Event.PlaybackTrackChanged) {
        // Update song index when track changes
        if (event.nextTrack !== undefined && event.nextTrack !== null) {
          setSongIndex(event.nextTrack);
        }
      }
    } catch (error) {
      console.error('Error handling track player event:', error);
    }
  });

  Appearance.addChangeListener(scheme => {
    setTheme(scheme.colorScheme);
  });

  // Setup track player
  const setupPlayerIfNeeded = async () => {
    if (playerSetupAttempted) {
      return playerSetupComplete;
    }

    setPlayerSetupAttempted(true);

    try {
      // First destroy any existing instance
      try {
        await TrackPlayer.destroy();
      } catch (destroyError) {
        console.log('No previous player instance to destroy');
      }

      // Setup new player instance
      await TrackPlayer.setupPlayer({
        minBuffer: 15, // Reduce buffer size
        maxBuffer: 50,
        playBuffer: 3,
        waitForBuffer: true,
      });

      // Set options
      await TrackPlayer.updateOptions({
        android: {
          appKilled: {
            keepNotification: false, // Don't keep notification when app is killed
          },
        },
        capabilities: ['play', 'pause', 'stop', 'skipToNext', 'skipToPrevious'],
        compactCapabilities: ['play', 'pause', 'stop'],
        progressUpdateEventInterval: 2, // Reduce update interval
      });

      // Verify player is ready
      const state = await TrackPlayer.getState();
      if (state === null) {
        throw new Error('Player setup verification failed');
      }

      console.log('TrackPlayer setup complete, state:', state);
      setPlayerSetupComplete(true);
      return true;
    } catch (error) {
      console.error('Error setting up TrackPlayer:', error);
      setErrorMessage('Failed to setup music player. Please restart the app.');
      setPlayerSetupComplete(false);
      return false;
    }
  };

  // Load songs when component mounts - use our safe data fetching hook to prevent infinite loops
  useSafeDataFetching(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    const initializeLibrary = async () => {
      try {
        if (!mounted) {
          return;
        }

        setIsLoading(true);
        setErrorMessage('');

        // Check network connectivity
        if (!networkConnected) {
          console.log('No network connection, using fallback songs');
          setErrorMessage('No internet connection. Using offline songs.');
          setSongs(fallbackSongs);
          setIsLoading(false);
          return;
        }

        // Setup player with retry mechanism
        let setupSuccess = false;
        while (retryCount < maxRetries && !setupSuccess && mounted) {
          try {
            console.log(
              `Setting up player (attempt ${retryCount + 1}/${maxRetries})...`,
            );
            setupSuccess = await setupPlayerIfNeeded();
            if (setupSuccess) {
              break;
            }
          } catch (setupError) {
            console.error(
              `Player setup attempt ${retryCount + 1} failed:`,
              setupError,
            );
            retryCount++;
            if (retryCount < maxRetries && mounted) {
              await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
          }
        }

        // Load songs regardless of player setup
        try {
          console.log('Loading songs...');
          await loadTrendingSongs();

          if (!mounted) {
            return;
          }

          // Show warning if player setup failed but we have songs
          if (!setupSuccess && songs.length > 0) {
            setErrorMessage(
              'Music playback may be limited. Please restart the app if issues persist.',
            );
          }
        } catch (loadError) {
          console.error('Error loading songs:', loadError);
          if (mounted) {
            setErrorMessage(
              'Failed to load songs. Please check your connection and try again.',
            );
            setSongs(fallbackSongs);
          }
        }
      } catch (error) {
        console.error('Error initializing library:', error);
        if (mounted) {
          setErrorMessage(
            'Failed to initialize library. Please restart the app.',
          );
          setSongs(fallbackSongs);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Try to determine if we should use BottomSheet or Modal
    // On some devices/versions BottomSheet may not work well
    try {
      // This is just a test to see if BottomSheet is properly imported
      if (BottomSheet) {
        setUseBottomSheet(true);
      }
    } catch (error) {
      console.log('Using Modal fallback instead of BottomSheet:', error);
      setUseBottomSheet(false);
    }

    initializeLibrary();

    return () => {
      mounted = false;
      // Clean up player on unmount
      if (playerSetupComplete) {
        TrackPlayer.reset()
          .then(() => TrackPlayer.destroy())
          .catch(console.error);
      }
    };
  }, [networkConnected]);

  // Monitor network status
  useEffect(() => {
    if (networkConnected && errorMessage && errorMessage.includes('network')) {
      // If network is back and we had a network error, retry loading songs
      loadTrendingSongs();
    }
  }, [networkConnected]);

  // Load trending songs from API
  const loadTrendingSongs = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Always have fallback songs ready just in case
      if (!songs || songs.length === 0) {
        setSongs(fallbackSongs);
      }

      if (!networkConnected) {
        console.log('No network connection, using fallback songs');
        setErrorMessage('No internet connection. Using offline songs.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching trending songs from API...');
      const fetchedSongs = await fetchTrendingSongs(20);

      if (fetchedSongs && fetchedSongs.length > 0) {
        console.log(`Successfully loaded ${fetchedSongs.length} songs`);
        setSongs(fetchedSongs);

        // Pre-load the track data if player is setup
        try {
          // Double check that player is setup correctly
          if (playerSetupComplete) {
            // Check player state before trying to use it
            const playerState = await TrackPlayer.getState().catch(() => null);
            if (playerState !== null) {
              console.log(
                'Adding songs to player queue, player state:',
                playerState,
              );
              await TrackPlayer.reset().catch(e =>
                console.error('Error resetting player:', e),
              );
              await TrackPlayer.add(fetchedSongs).catch(e =>
                console.error('Error adding songs to player:', e),
              );
              console.log('Added songs to TrackPlayer queue');
            } else {
              console.warn(
                'Player appears to be in an invalid state, retrying setup',
              );
              const setupRetry = await setupPlayerIfNeeded();
              if (setupRetry) {
                console.log('Player setup retry succeeded, adding songs');
                await TrackPlayer.reset().catch(e =>
                  console.error('Error resetting player:', e),
                );
                await TrackPlayer.add(fetchedSongs).catch(e =>
                  console.error('Error adding songs to player:', e),
                );
              } else {
                console.warn('Player setup retry failed');
              }
            }
          } else {
            console.warn('Player not properly setup, attempting setup again');
            const setupRetry = await setupPlayerIfNeeded();
            if (setupRetry) {
              console.log('Late player setup succeeded, adding songs');
              await TrackPlayer.reset().catch(e =>
                console.error('Error resetting player:', e),
              );
              await TrackPlayer.add(fetchedSongs).catch(e =>
                console.error('Error adding songs to player:', e),
              );
            } else {
              console.warn(
                'Late player setup failed, songs will be display-only',
              );
            }
          }
        } catch (playerError) {
          console.error('Error adding songs to track player:', playerError);
          // We'll still keep the songs in state even if adding to player fails
        }
      } else {
        console.warn('No songs returned from API, using fallback songs');
        setErrorMessage(
          'Could not load songs from server. Using offline songs.',
        );
      }
    } catch (error) {
      console.error('Error in loadTrendingSongs:', error);

      // Check for common error types
      if (error.message && error.message.includes('network')) {
        setErrorMessage('Network error. Please check your connection.');
      } else if (error.response && error.response.status === 500) {
        setErrorMessage(
          'Server error. The music service is currently unavailable.',
        );
      } else if (error.response && error.response.status === 400) {
        setErrorMessage('API error. Please try again later.');
      } else {
        setErrorMessage(
          'An error occurred while loading songs. Using offline songs.',
        );
      }

      // Make sure we have at least the fallback songs
      if (!songs || songs.length === 0) {
        setSongs(fallbackSongs);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Search for songs by query
  useEffect(() => {
    // Don't search if no network
    if (!networkConnected && searchQuery.trim() !== '') {
      setErrorMessage('Cannot search without internet connection');
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim() !== '') {
        setIsLoading(true);
        try {
          const searchResults = await searchSongsByQuery(searchQuery);
          if (searchResults && searchResults.length > 0) {
            setSongs(searchResults);
            setErrorMessage('');
          } else {
            // Show a message when no results found
            setSongs([]);
            setErrorMessage('No songs found for your search.');
          }
        } catch (error) {
          console.error('Error searching songs:', error);
          setErrorMessage('Error searching. Please try again.');
          // Don't reset songs here to keep previous results visible
        } finally {
          setIsLoading(false);
        }
      } else {
        // If search query is empty, load trending songs
        loadTrendingSongs();
      }
    }, 500); // Debounce search for 500ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, networkConnected]);

  const handleOpenPress = () => {
    if (useBottomSheet && bottomSheetRef.current) {
      bottomSheetRef.current.expand();
    } else {
      setModalVisible(true);
    }
  };

  const handleClosePress = () => {
    if (useBottomSheet && bottomSheetRef.current) {
      bottomSheetRef.current.close();
    } else {
      setModalVisible(false);
    }
  };

  // Setup player and play songs
  const setUpPlayer = async () => {
    try {
      // Check if player is setup first
      if (!playerSetupComplete) {
        const setupSuccess = await setupPlayerIfNeeded();
        if (!setupSuccess) {
          throw new Error('Player setup failed');
        }
      }

      // Make sure we have songs to play
      if (!songs || songs.length === 0) {
        console.warn('No songs available to play');
        return false;
      }

      // Reset the player to clear previous queue
      await TrackPlayer.reset().catch(e => {
        console.error('Error resetting player:', e);
        throw e;
      });

      // Add all songs to the queue
      await TrackPlayer.add(songs).catch(e => {
        console.error('Error adding songs to player:', e);
        throw e;
      });
      console.log(`Added ${songs.length} songs to player queue`);

      // Set repeat mode to repeat all songs by default
      await TrackPlayer.setRepeatMode(RepeatMode.Queue).catch(e => {
        console.warn('Error setting repeat mode:', e);
        // Not critical, continue
      });

      // Reset playback error state
      setPlaybackError(null);
      return true;
    } catch (error) {
      console.error('Error setting up player:', error);
      setErrorMessage('Failed to setup music player. Please try again.');

      // Show error to user
      Alert.alert(
        'Player Setup Error',
        'There was an error setting up the music player. ' +
          'Please try again or restart the app.',
        [{text: 'OK'}],
      );
      return false;
    }
  };

  // Play a specific song
  const playSong = async (song, index) => {
    try {
      console.log(`Attempting to play song: ${song.title} by ${song.artist}`);

      if (!song || !song.url) {
        console.error('Invalid song or missing URL:', song);
        Alert.alert(
          'Cannot Play Song',
          'This song cannot be played due to missing audio data.',
          [{text: 'OK'}],
        );
        return;
      }

      // If player not setup, try to set it up
      if (!playerSetupComplete) {
        console.log('Player not initialized, attempting setup...');
        const setupSuccess = await setUpPlayer();
        if (!setupSuccess) {
          Alert.alert(
            'Cannot Play',
            'Music player could not be initialized. Please restart the app.',
            [{text: 'OK'}],
          );
          return;
        }
      }

      // Check if we need to initialize the player
      const playerState = await TrackPlayer.getState().catch(e => {
        console.error('Error getting player state:', e);
        return State.None;
      });

      console.log('Current player state:', playerState);
      const isPlayerReady =
        playerState !== State.None &&
        playerState !== State.Stopped &&
        playerState !== null;

      if (!isPlayerReady) {
        console.log('Player not ready, setting up...');
        const setupSuccess = await setUpPlayer();
        if (!setupSuccess) {
          console.error('Failed to setup player for playback');
          return;
        }
      }

      // Make sure we have a valid queue
      let currentQueue = [];
      try {
        currentQueue = await TrackPlayer.getQueue();
      } catch (queueError) {
        console.error('Error getting queue, resetting player:', queueError);
        const resetSuccess = await setUpPlayer();
        if (!resetSuccess) {
          return;
        }

        // Try to get queue again
        try {
          currentQueue = await TrackPlayer.getQueue();
        } catch (retryError) {
          console.error('Failed to get queue after reset:', retryError);
          Alert.alert(
            'Playback Error',
            'Failed to prepare music player. Please try again.',
            [{text: 'OK'}],
          );
          return;
        }
      }

      // Make sure the index is valid
      if (index < 0 || index >= songs.length || index >= currentQueue.length) {
        console.error(
          'Invalid song index:',
          index,
          'queue length:',
          currentQueue.length,
        );

        // Try to match song by ID in the queue
        const queueIndex = currentQueue.findIndex(
          track => track.id === song.id,
        );
        if (queueIndex !== -1) {
          console.log('Found song in queue at index:', queueIndex);
          index = queueIndex;
        } else {
          console.log('Song not found in queue, adding songs to queue...');
          // Reset player and add all songs
          await setUpPlayer();
        }
      }

      // Skip to the selected song and play it
      setSongIndex(index);

      try {
        await TrackPlayer.skip(index);
        await TrackPlayer.play();
        console.log(`Playing song: ${song.title} by ${song.artist}`);

        // Open the bottom sheet or modal
        handleOpenPress();

        // Reset any previous playback errors
        setPlaybackError(null);
      } catch (playError) {
        console.error('Error during play operation:', playError);

        // Try alternative play approach
        try {
          console.log('Attempting alternative play approach...');
          await TrackPlayer.pause();
          await TrackPlayer.seekTo(0);
          await TrackPlayer.skip(index);
          await new Promise(resolve => setTimeout(resolve, 300)); // Short delay
          await TrackPlayer.play();
        } catch (retryError) {
          console.error('Alternative play approach failed:', retryError);
          throw retryError;
        }
      }
    } catch (error) {
      console.error('Error playing song:', error);

      // Show error to user
      Alert.alert(
        'Playback Error',
        `Failed to play "${song.title}". ${error.message}`,
        [{text: 'OK'}],
      );

      // Try to recover by playing another song
      if (songs.length > 1 && index < songs.length - 1) {
        try {
          console.log('Attempting to recover by playing next song');
          await playSong(songs[index + 1], index + 1);
        } catch (recoveryError) {
          console.error(
            'Failed to recover from playback error:',
            recoveryError,
          );
        }
      }
    }
  };

  const next = async () => {
    try {
      if (!playerSetupComplete) {
        console.warn('Cannot skip to next song: player not set up');
        return;
      }

      // Make sure we have songs in the queue
      let queue = [];
      try {
        queue = await TrackPlayer.getQueue();
      } catch (e) {
        console.error('Error getting queue for next:', e);

        // Try to setup player again
        await setUpPlayer();
        try {
          queue = await TrackPlayer.getQueue();
        } catch (retryError) {
          console.error('Failed to get queue after retry:', retryError);
          return;
        }
      }

      if (queue.length === 0) {
        console.warn('Cannot skip to next: empty queue');
        return;
      }

      const nextIndex = songIndex + 1 < queue.length ? songIndex + 1 : 0;
      console.log(`Skipping to next song (index ${nextIndex})`);

      try {
        await TrackPlayer.skip(nextIndex);
        await TrackPlayer.play();
        console.log('Now playing next song at index:', nextIndex);
        setSongIndex(nextIndex);
      } catch (error) {
        console.error('Error in next() playback:', error);

        // Try with delay approach
        try {
          await TrackPlayer.pause();
          await new Promise(resolve => setTimeout(resolve, 300));
          await TrackPlayer.skip(nextIndex);
          await new Promise(resolve => setTimeout(resolve, 300));
          await TrackPlayer.play();
          setSongIndex(nextIndex);
        } catch (recoveryError) {
          console.error('Failed to recover next playback:', recoveryError);
          setPlaybackError('Failed to play next song');
          throw recoveryError;
        }
      }
    } catch (error) {
      console.error('Error skipping to next song:', error);
      // For UI feedback
      setPlaybackError('Failed to play next song');
    }
  };

  const previous = async () => {
    try {
      if (!playerSetupComplete) {
        console.warn('Cannot skip to previous song: player not set up');
        return;
      }

      // Make sure we have songs in the queue
      let queue = [];
      try {
        queue = await TrackPlayer.getQueue();
      } catch (e) {
        console.error('Error getting queue for previous:', e);

        // Try to setup player again
        await setUpPlayer();
        try {
          queue = await TrackPlayer.getQueue();
        } catch (retryError) {
          console.error('Failed to get queue after retry:', retryError);
          return;
        }
      }

      if (queue.length === 0) {
        console.warn('Cannot skip to previous: empty queue');
        return;
      }

      const prevIndex = songIndex - 1 >= 0 ? songIndex - 1 : queue.length - 1;
      console.log(`Skipping to previous song (index ${prevIndex})`);

      try {
        await TrackPlayer.skip(prevIndex);
        await TrackPlayer.play();
        console.log('Now playing previous song at index:', prevIndex);
        setSongIndex(prevIndex);
      } catch (error) {
        console.error('Error in previous() playback:', error);

        // Try with delay approach
        try {
          await TrackPlayer.pause();
          await new Promise(resolve => setTimeout(resolve, 300));
          await TrackPlayer.skip(prevIndex);
          await new Promise(resolve => setTimeout(resolve, 300));
          await TrackPlayer.play();
          setSongIndex(prevIndex);
        } catch (recoveryError) {
          console.error('Failed to recover previous playback:', recoveryError);
          setPlaybackError('Failed to play previous song');
          throw recoveryError;
        }
      }
    } catch (error) {
      console.error('Error skipping to previous song:', error);
      // For UI feedback
      setPlaybackError('Failed to play previous song');
    }
  };

  const handleChange = async val => {
    try {
      if (!playerSetupComplete) {
        console.warn('Cannot seek: player not set up');
        return;
      }

      // First check if the player is in a playable state
      const state = await TrackPlayer.getState().catch(e => {
        console.error('Error getting player state for seek:', e);
        return null;
      });

      if (state === null || state === State.None || state === State.Stopped) {
        console.warn('Cannot seek: player not in playable state');
        return;
      }

      // Make sure value is valid
      if (typeof val !== 'number' || isNaN(val)) {
        console.error('Invalid seek value:', val);
        return;
      }

      console.log(`Seeking to position: ${val}`);
      await TrackPlayer.seekTo(val).catch(e => {
        console.error('Error seeking position:', e);
        throw e;
      });
    } catch (error) {
      console.error('Error handling seek:', error);
      // No need to show an error banner for seek issues as it's not critical
    }
  };

  const snapPoints = useMemo(() => ['7%', '92%'], []);

  // Get the current song safely
  const currentSong = useMemo(() => {
    if (
      songs &&
      songs.length > 0 &&
      songIndex >= 0 &&
      songIndex < songs.length
    ) {
      return songs[songIndex];
    }
    return {
      title: 'No Song',
      artist: 'Unknown',
      image: require('../../../assets/album-covers/death-bed.jpg'),
    };
  }, [songs, songIndex]);

  const renderNoConnectionMessage = () => {
    if (!networkConnected) {
      return (
        <View style={styles.connectionWarning}>
          <Text style={styles.connectionWarningText}>
            No internet connection. Some features may be limited.
          </Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView
      style={theme === 'light' ? libraryUI.container : dmLibraryUI.container}>
      <View style={libraryUI.headerContainer}>
        <Text style={theme === 'light' ? libraryUI.title : dmLibraryUI.title}>
          Library
        </Text>
        <TouchableOpacity
          style={{paddingRight: 10}}
          onPress={() => navigation.navigate('Profile')}>
          <ImageBackground
            source={require('../../../assets/default-imgs/default-pfp.png')}
            style={libraryUI.userAvatarSize}
            imageStyle={libraryUI.userAvatar}
          />
        </TouchableOpacity>
      </View>

      {renderNoConnectionMessage()}

      <View style={{paddingLeft: 10}}>
        <TextInput
          style={libraryUI.searchInput}
          placeholder="search for songs here..."
          placeholderTextColor="#A9A9A9"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <ScrollView style={libraryUI.card}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#C73EFF" />
            <Text style={styles.loadingText}>Loading songs...</Text>
          </View>
        ) : songs.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>
              {errorMessage || 'No songs available'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadTrendingSongs}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={libraryUI.albumCoversContainer}>
            {songs.map((song, mapIndex) => {
              return (
                <View key={mapIndex}>
                  <TouchableOpacity onPress={() => playSong(song, mapIndex)}>
                    <Image
                      source={
                        typeof song.image === 'object' && song.image.uri
                          ? {uri: song.image.uri}
                          : require('../../../assets/album-covers/death-bed.jpg')
                      }
                      style={libraryUI.albumCovers}
                    />
                  </TouchableOpacity>
                  <Text
                    style={
                      theme === 'light'
                        ? libraryUI.cardTitle
                        : dmLibraryUI.cardTitle
                    }
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {song.title}
                  </Text>
                  <Text
                    style={libraryUI.cardArtistName}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {song.artist}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {useBottomSheet ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          backgroundStyle={
            theme === 'light' ? styles.bottomSheetBg : styles.bottomSheetBgDark
          }>
          <View
            style={
              theme === 'light' ? musicPlayerUI.container : dmPlayerUI.container
            }>
            <View style={musicPlayerUI.imageContainer}>
              <Image
                source={
                  currentSong.artwork ||
                  (currentSong.image && currentSong.image.uri)
                    ? {uri: currentSong.artwork || currentSong.image.uri}
                    : require('../../../assets/album-covers/death-bed.jpg')
                }
                style={musicPlayerUI.songImage}
              />
            </View>
            <View style={musicPlayerUI.songInfoBar}>
              <Text
                style={
                  theme === 'light'
                    ? musicPlayerUI.songName
                    : dmPlayerUI.songName
                }>
                {currentSong.title}
              </Text>
              <Text
                style={
                  theme === 'light'
                    ? musicPlayerUI.songArtist
                    : dmPlayerUI.songArtist
                }>
                {currentSong.artist}
              </Text>
            </View>
            <View style={musicPlayerUI.seekBar}>
              <Slider
                style={{width: '100%'}}
                maximumValue={duration || 100}
                minimumValue={0}
                value={position || 0}
                minimumTrackTintColor={
                  theme === 'light' ? '#4D20AF' : '#7744CF'
                }
                maximumTrackTintColor={
                  theme === 'light' ? '#dedede' : '#444444'
                }
                onSlidingComplete={handleChange}
                thumbTintColor={theme === 'light' ? '#7744CF' : '#9966FF'}
              />
              <View style={musicPlayerUI.seekBarInfoContainer}>
                <Text
                  style={
                    theme === 'light'
                      ? musicPlayerUI.seekBarText
                      : dmPlayerUI.seekBarText
                  }>
                  {formatTime(position || 0)}
                </Text>
                <Text
                  style={
                    theme === 'light'
                      ? musicPlayerUI.seekBarText
                      : dmPlayerUI.seekBarText
                  }>
                  {formatTime((duration || 0) - (position || 0))}
                </Text>
              </View>
            </View>
            <Controller onNext={next} onPrevious={previous} theme={theme} />
            <VolumeSlider theme={theme} />
          </View>
        </BottomSheet>
      ) : (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                theme === 'light'
                  ? styles.lightModalContent
                  : styles.darkModalContent,
              ]}>
              <View style={musicPlayerUI.headerContainer}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text
                    style={
                      theme === 'light'
                        ? styles.closeButton
                        : styles.closeButtonDark
                    }>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={musicPlayerUI.imageContainer}>
                <Image
                  source={
                    currentSong.artwork ||
                    (currentSong.image && currentSong.image.uri)
                      ? {uri: currentSong.artwork || currentSong.image.uri}
                      : require('../../../assets/album-covers/death-bed.jpg')
                  }
                  style={musicPlayerUI.songImage}
                />
              </View>
              <View style={musicPlayerUI.songInfoBar}>
                <Text
                  style={
                    theme === 'light'
                      ? musicPlayerUI.songName
                      : dmPlayerUI.songName
                  }>
                  {currentSong.title}
                </Text>
                <Text
                  style={
                    theme === 'light'
                      ? musicPlayerUI.songArtist
                      : dmPlayerUI.songArtist
                  }>
                  {currentSong.artist}
                </Text>
              </View>
              <View style={musicPlayerUI.seekBar}>
                <Slider
                  style={{width: '100%'}}
                  maximumValue={duration || 100}
                  minimumValue={0}
                  value={position || 0}
                  minimumTrackTintColor={
                    theme === 'light' ? '#4D20AF' : '#7744CF'
                  }
                  maximumTrackTintColor={
                    theme === 'light' ? '#dedede' : '#444444'
                  }
                  onSlidingComplete={handleChange}
                  thumbTintColor={theme === 'light' ? '#7744CF' : '#9966FF'}
                />
                <View style={musicPlayerUI.seekBarInfoContainer}>
                  <Text
                    style={
                      theme === 'light'
                        ? musicPlayerUI.seekBarText
                        : dmPlayerUI.seekBarText
                    }>
                    {formatTime(position || 0)}
                  </Text>
                  <Text
                    style={
                      theme === 'light'
                        ? musicPlayerUI.seekBarText
                        : dmPlayerUI.seekBarText
                    }>
                    {formatTime((duration || 0) - (position || 0))}
                  </Text>
                </View>
              </View>
              <Controller onNext={next} onPrevious={previous} theme={theme} />
              <VolumeSlider theme={theme} />
            </View>
          </View>
        </Modal>
      )}

      {/* Error info modal */}
      {playbackError && (
        <TouchableOpacity
          style={styles.errorBanner}
          onPress={() => setPlaybackError(null)}>
          <Text style={styles.errorBannerText}>
            Playback error: {playbackError}. Tap to dismiss.
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const timerUI = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerText: {
    fontSize: 13,
    color: 'black',
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const dmTimerUI = StyleSheet.create({
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerText: {
    fontSize: 13,
    color: 'white',
    paddingLeft: 10,
    paddingRight: 10,
  },
});

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: '#c73e3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#C73EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#C73EFF',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'flex-end',
  },
  closeButtonDark: {
    backgroundColor: '#C73EFF',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignSelf: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  lightModalContent: {
    backgroundColor: 'white',
  },
  darkModalContent: {
    backgroundColor: 'black',
  },
  bottomSheetBg: {
    backgroundColor: 'white',
  },
  bottomSheetBgDark: {
    backgroundColor: 'black',
  },
  seekBarInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  seekBarText: {
    fontSize: 13,
    color: 'black',
  },
  seekBarTextDark: {
    fontSize: 13,
    color: 'white',
  },
  connectionWarning: {
    backgroundColor: 'rgba(200, 50, 50, 0.1)',
    padding: 8,
    margin: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(200, 50, 50, 0.3)',
  },
  connectionWarningText: {
    color: '#FF6B6B',
    fontSize: 12,
    textAlign: 'center',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(200, 50, 50, 0.9)',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
  },
  errorBannerText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default Library;
