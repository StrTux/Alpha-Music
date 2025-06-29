import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMusic } from '../context/MusicContext';
import { useDominantColor } from '../hooks/useDominantColor';
import SpotifyService from '../services/SpotifyService';

const SpotifyPlaylistScreen = () => {
  const nav = useNavigation();
  const route = useRoute();
  const { playlistId, playlistName, playlistImage } = route.params;
  const { playTrack } = useMusic();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [playlistDetails, setPlaylistDetails] = useState(null);

  const colorObj = useDominantColor(playlistImage);
  let gradientColors = ['#1DB954', '#000000cc'];
  if (typeof colorObj === 'object' && colorObj.top && colorObj.bottom) {
    gradientColors = [colorObj.top, colorObj.bottom];
  } else if (typeof colorObj === 'string') {
    gradientColors = [colorObj, '#111'];
  }

  useEffect(() => {
    fetchPlaylistData();
  }, [playlistId]);

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);
      
      // Get playlist details
      const details = await SpotifyService.getPlaylistDetails(playlistId);
      setPlaylistDetails(details);

      // Get all tracks from Spotify playlist
      const spotifyTracks = await SpotifyService.getPlaylistTracks(playlistId);
      console.log(`Found ${spotifyTracks.length} tracks in Spotify playlist`);

      // Convert Spotify tracks to the format expected by the UI
      const formattedSongs = spotifyTracks.map((track, index) => ({
        id: `spotify_${track.id}_${index}`, // Make unique keys
        name: track.name,
        primary_artists: track.artists,
        subtitle: track.artists,
        image: track.image,
        duration: track.duration,
        spotify_only: true,
        spotify_name: track.name,
        spotify_artists: track.artists,
        spotify_image: track.image,
        spotify_id: track.id
      }));

      setSongs(formattedSongs);
    } catch (error) {
      console.error('Error fetching playlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySong = useCallback(async (item) => {
    if (loadingId === item.id) return; // Prevent multiple clicks
    setLoadingId(item.id);
    
    try {
      // For Spotify tracks, try to find them on JioSaavn first
      const q = encodeURIComponent(`${item.name} ${item.primary_artists || item.subtitle}`);
      const resp = await fetch(`https://strtux-main.vercel.app/search/songs?q=${q}`);
      const js = await resp.json();
      const song = js.data?.results?.[0];
      
      if (song?.download_url?.length) {
        // Found on JioSaavn, play it
        const found = song.download_url.find(v => v.quality === '320kbps');
        const url = found?.link || song.download_url.pop().link;
        const quality = found?.quality || song.download_url[song.download_url.length - 1].quality;
        console.log('Playing URL:', url);
        console.log('Playing quality:', quality);
        
        playTrack({
          id: song.id,
          url,
          title: song.name,
          artist: song.subtitle || song.artist,
          artwork: song.image,
          album: song.album,
          duration: song.duration,
        });
      } else {
        // Not found on JioSaavn, show Spotify-only message
        alert('This song is only available on Spotify. Please use Spotify app to play it.');
      }
    } catch (error) {
      console.error('Error playing song:', error);
      alert('Unable to play this song');
    } finally {
      setLoadingId(null);
    }
  }, [loadingId, playTrack]);

  const renderSong = useCallback(({ item, index }) => (
    <TouchableOpacity 
      style={styles.songItem} 
      onPress={() => handlePlaySong(item)} 
      disabled={loadingId === item.id}
      activeOpacity={0.7}
    >
      <Text style={styles.songNumber}>{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.name}</Text>
        <Text style={styles.songArtist}>{item.primary_artists || item.subtitle}</Text>
      </View>
      <Text style={styles.songDur}>
        {item.duration
          ? `${Math.floor(item.duration/60000)}:${String(Math.floor((item.duration%60000)/1000)).padStart(2,'0')}`
          : '--:--'}
      </Text>
      <TouchableOpacity style={styles.moreBtn}>
        <Icon name="ellipsis-vertical" size={20} color="#fff" />
      </TouchableOpacity>
      {loadingId === item.id && <ActivityIndicator color="#1DB954" style={{ marginLeft: 10 }} />}
    </TouchableOpacity>
  ), [handlePlaySong, loadingId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading playlist...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Icon name="search" size={24} color="#fff" style={styles.headerIcon} />
        <Icon name="ellipsis-vertical" size={24} color="#fff" style={styles.headerIcon} />
      </View>

      <View style={styles.infoSection}>
        <Image source={{ uri: playlistImage || playlistDetails?.image }} style={styles.coverNoElevation} />
        <Text style={styles.title}>{playlistName || playlistDetails?.name || 'Playlist'}</Text>
        <Text style={styles.subTitle}>{playlistDetails?.owner || 'Spotify'}</Text>
        <Text style={styles.trackCount}>{songs.length} songs</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.shuffleBtn}>
            <Icon name="shuffle" size={20} color="#000" />
            <Text style={styles.shuffleText}>SHUFFLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn}>
            <Icon name="play" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={songs}
        renderItem={renderSong}
        keyExtractor={i => i.id}
        style={styles.list}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 60, // height of each item
          offset: 60 * index,
          index,
        })}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: { 
    flexDirection: 'row', 
    padding: 16, 
    alignItems: 'center' 
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerIcon: { marginLeft: 16 },
  infoSection: { alignItems: 'center', paddingBottom: 16 },
  coverNoElevation: { width: 200, height: 200, borderRadius: 8, marginBottom: 16 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: '#ccc', fontSize: 16, marginVertical: 4 },
  trackCount: { color: '#aaa', fontSize: 14, marginBottom: 16 },
  buttonsRow: { flexDirection: 'row', alignItems: 'center' },
  shuffleBtn: { flexDirection: 'row', backgroundColor: '#fff', padding: 8, borderRadius: 20, marginRight: 16, alignItems: 'center' },
  shuffleText: { marginLeft: 6, fontWeight: 'bold', color: '#000' },
  playBtn: { width: 56, height: 56, borderRadius: 28, borderColor: '#fff', borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1, paddingHorizontal: 18 },
  songItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, height: 60 },
  songNumber: { width: 30, color: '#aaa', textAlign: 'center' },
  songInfo: { flex: 1, marginHorizontal: 12 },
  songTitle: { color: '#fff', fontSize: 12 },
  songArtist: { color: '#ccc', fontSize: 10 },
  songDur: { color: '#ccc', fontSize: 12, marginRight: 12 },
  moreBtn: { padding: 8 },
});

export default SpotifyPlaylistScreen; 