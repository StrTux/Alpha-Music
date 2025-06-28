import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator, Image, StyleSheet
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useMusic } from '../../context/MusicContext';
import { useDominantColor } from '../../hooks/useDominantColor';

const BASE_URL = "https://strtux-main.vercel.app";
const PLACEHOLDER_IMG = require('../../assets/placeholder.png');

export default function AlbumScreen() {
  const { album } = useRoute().params;
  const { playTrack } = useMusic();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const colorObj = useDominantColor(album.image);
  let gradientColors = ['#1DB954', '#000000cc'];
  if (typeof colorObj === 'object' && colorObj.top && colorObj.bottom) {
    gradientColors = [colorObj.top, colorObj.bottom];
  } else if (typeof colorObj === 'string') {
    gradientColors = [colorObj, '#111'];
  }

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/search/songs?q=${encodeURIComponent(album.name)}`)
      .then(res => res.json())
      .then(json => {
        if (json.status === 'Success' && json.data?.results) {
          setSongs(json.data.results);
        } else {
          setSongs([]);
        }
      })
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, [album.name]);

  const handlePlayTrack = useCallback(async (song) => {
    if (loadingId === song.id) return;
    setLoadingId(song.id);
    let url = '';
    let quality = '';
    if (song.download_url && Array.isArray(song.download_url)) {
      const highQuality = song.download_url.find(v => v.quality === '320kbps');
      if (highQuality) {
        url = highQuality.link;
        quality = highQuality.quality;
      } else if (song.download_url.length > 0) {
        url = song.download_url[song.download_url.length - 1].link;
        quality = song.download_url[song.download_url.length - 1].quality;
      }
    }
    if (!url) {
      setLoadingId(null);
      return;
    }
    console.log('Playing URL:', url);
    console.log('Playing quality:', quality);
    const track = {
      id: song.id,
      url,
      title: song.name,
      artist: song.primary_artists || song.subtitle || album.subtitle,
      artwork: album.image,
      duration: song.duration,
    };
    playTrack(track);
    setLoadingId(null);
  }, [loadingId, playTrack, album.subtitle, album.image]);

  const renderSong = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={styles.songItem}
      onPress={() => handlePlayTrack(item)}
      disabled={loadingId === item.id}
      activeOpacity={0.7}
    >
      <Text style={styles.songNumber}>{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.primary_artists || item.subtitle}</Text>
      </View>
      <Text style={styles.songDuration}>
        {item.duration
          ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2, '0')}`
          : '--:--'}
      </Text>
      {loadingId === item.id && <ActivityIndicator color="#1DB954" style={{ marginLeft: 10 }} />}
    </TouchableOpacity>
  ), [handlePlayTrack, loadingId]);

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <Icon name="search" size={24} color="#fff" style={styles.headerIcon} />
        <Icon name="ellipsis-vertical" size={24} color="#fff" style={styles.headerIcon} />
      </View>
      <View style={styles.infoSection}>
        {/* ✅ Big album image retained */}
        <Image source={album.image ? { uri: album.image } : PLACEHOLDER_IMG} style={styles.coverNoElevation} />
        <Text style={styles.title}>{album.name}</Text>
        <Text style={styles.subTitle}>{album.subtitle}</Text>
        <Text style={styles.trackCount}>{songs.length} songs</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ flex: 1 }} />
      ) : (
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
            length: 60,
            offset: 60 * index,
            index,
          })}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  headerIcon: { marginLeft: 16 },
  infoSection: { alignItems: 'center', paddingBottom: 16 },
  coverNoElevation: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#222',
  },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  subTitle: { color: '#ccc', fontSize: 16, marginVertical: 4 },
  trackCount: { color: '#aaa', fontSize: 14, marginBottom: 16 },
  list: { flex: 1, paddingHorizontal: 18 },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    height: 60,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  songNumber: {
    width: 30,
    color: '#aaa',
    textAlign: 'center',
  },
  songInfo: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  songTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  songArtist: {
    color: '#aaa',
    fontSize: 13,
  },
  songDuration: {
    color: '#ccc',
    fontSize: 14,
    width: 50,
    textAlign: 'right',
  },
});
