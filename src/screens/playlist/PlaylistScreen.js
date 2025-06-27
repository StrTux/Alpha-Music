import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMusic } from '../../context/MusicContext';
import MiniPlayer from '../playerTab/MiniPlayer';
import MiniVlcPlayer from '../../components/MiniVlcPlayer';

const BASE_URL = "https://strtux-main.vercel.app";

const getHighQualityImage = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/500';
  if (imageUrl.includes('saavncdn.com')) {
    return imageUrl.replace(/\d+x\d+/, '500x500');
  }
  return imageUrl;
};

const PlaylistScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { playlist } = route.params;
  const { playSong, currentTrack } = useMusic();
  const [songs, setSongs] = useState(Array.isArray(playlist.songs) && playlist.songs.length > 0 ? playlist.songs : []);
  const [loading, setLoading] = useState(!(Array.isArray(playlist.songs) && playlist.songs.length > 0));
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [vlcTrack, setVlcTrack] = useState(null);

  useEffect(() => {
    if (songs.length === 0) {
      setLoading(true);
      fetch(`${BASE_URL}/playlist?id=${playlist.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === 'Success' && json.data?.songs) {
            setSongs(json.data.songs);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [playlist.id]);

  // Play a song with robust search and playback logic
  const handlePlaySong = async (item) => {
    try {
      setLoadingItemId(item.id);
      const musicName = item.name || item.title || '';
      const artistName = item.primary_artists || item.artist || item.subtitle || '';
      const query = encodeURIComponent(`${musicName} ${artistName}`);
      const response = await fetch(`${BASE_URL}/search/songs?q=${query}`);
      const data = await response.json();
      if (data.status === 'Success' && data.data && data.data.results && data.data.results.length > 0) {
        const song = data.data.results[0];
        let downloadUrl = '';
        if (song.download_url && Array.isArray(song.download_url)) {
          const highQualityVersion = song.download_url.find(version => version.quality === '320kbps');
          if (highQualityVersion) {
            downloadUrl = highQualityVersion.link;
          } else if (song.download_url.length > 0) {
            downloadUrl = song.download_url[song.download_url.length - 1].link;
          }
        }
        if (downloadUrl.endsWith('.mp4')) {
          setVlcTrack({
            url: downloadUrl,
            title: song.name,
            artist: song.subtitle || song.artist,
            artwork: getHighQualityImage(song.image),
            duration: song.duration || 0,
          });
          setLoadingItemId(null);
          return;
        }
        const track = {
          id: song.id,
          url: downloadUrl,
          title: song.name,
          artist: song.subtitle || song.artist_map?.primary_artists?.[0]?.name || '',
          artwork: getHighQualityImage(song.image),
          album: song.album,
          duration: song.duration
        };
        if (!downloadUrl || !downloadUrl.startsWith('http')) {
          alert('This song cannot be played due to invalid audio URL.');
          setLoadingItemId(null);
          return;
        }
        if (typeof playSong === 'function') {
          await playSong(track);
        }
      } else {
        alert('No playable song found for this track.');
      }
    } catch (error) {
      alert('Error playing this song.');
    } finally {
      setLoadingItemId(null);
    }
  };

  const renderSongItem = ({ item, index }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => handlePlaySong(item)} disabled={loadingItemId === item.id}>
      <Text style={styles.songNumber}>{index + 1}</Text>
      <View style={styles.songDetails}>
        <Text style={styles.songTitle}>{item.name || item.title}</Text>
        <Text style={styles.songArtist}>{item.primary_artists || item.artist || item.subtitle}</Text>
      </View>
      <Text style={styles.songDuration}>
        {item.duration
          ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}`
          : '--:--'}
      </Text>
      <TouchableOpacity style={styles.moreButton}>
        <Icon name="ellipsis-vertical" size={20} color="#FFFFFF" />
      </TouchableOpacity>
      {loadingItemId === item.id && (
        <ActivityIndicator size="small" color="#1DB954" style={{ marginLeft: 10 }} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Playlist info */}
      <View style={styles.playlistInfoContainer}>
        <View style={styles.playlistCoverContainer}>
          {playlist.image ? (
            <Image source={{ uri: playlist.image }} style={styles.playlistCover} />
          ) : (
            <View style={styles.playlistCover} />
          )}
        </View>
        <Text style={styles.playlistTitle}>{playlist.name || playlist.title}</Text>
        <Text style={styles.playlistCreator}>{playlist.subtitle || playlist.follower_count ? `${playlist.follower_count} followers` : ''}</Text>
        <Text style={styles.playlistInfo}>{songs.length} songs</Text>
        
        {/* Action buttons */}
        <View style={styles.playlistActions}>
          <TouchableOpacity style={styles.downloadButton}>
            <Icon name="arrow-down" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleButton}>
            <Icon name="shuffle" size={20} color="#000000" />
            <Text style={styles.shuffleButtonText}>SHUFFLE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton}>
            <Icon name="play" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Songs list */}
      <View style={styles.songsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#1DB954" />
        ) : (
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: vlcTrack ? 100 : 20 }}
          />
        )}
      </View>
      
      {/* Mini Player (always at bottom, overlays content) */}
      {currentTrack && <MiniPlayer />}
      {vlcTrack && (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100 }}>
          <MiniVlcPlayer
            track={vlcTrack}
            onNext={() => {}}
            onPrev={() => {}}
            onClose={() => setVlcTrack(null)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  playlistInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  playlistCoverContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playlistCover: {
    width: 200,
    height: 200,
    backgroundColor: '#333',
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  playlistCreator: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  playlistInfo: {
    color: '#AAAAAA',
    fontSize: 14,
    marginBottom: 24,
  },
  playlistActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  downloadButton: {
    padding: 10,
    marginRight: 16,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    marginRight: 16,
  },
  shuffleButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  songsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  songNumber: {
    width: 30,
    color: '#AAAAAA',
    fontSize: 14,
    textAlign: 'center',
  },
  songDetails: {
    flex: 1,
    marginHorizontal: 12,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  songArtist: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  songDuration: {
    color: '#AAAAAA',
    fontSize: 14,
    marginRight: 12,
  },
  moreButton: {
    padding: 8,
  },
});

export default PlaylistScreen;
