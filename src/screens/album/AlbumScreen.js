import React, { useEffect, useState } from 'react';
import {
  View, Text, SafeAreaView, TouchableOpacity,
  FlatList, StatusBar, ActivityIndicator, Image, StyleSheet
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MiniVlcPlayer from '../../components/MiniVlcPlayer';

const BASE_URL = "https://strtux-main.vercel.app";

export default function AlbumScreen() {
  const { album } = useRoute().params;
  const nav = useNavigation();
  // If album.songs exists and is non-empty, use it directly
  const [songs, setSongs] = useState(Array.isArray(album.songs) && album.songs.length > 0 ? album.songs : []);
  const [loading, setLoading] = useState(!(Array.isArray(album.songs) && album.songs.length > 0));
  const [vlcTrack, setVlcTrack] = useState(null);

  // Fetch album songs only if not provided
  useEffect(() => {
    if (songs.length === 0) {
      setLoading(true);
      fetch(`${BASE_URL}/album?id=${album.id}`)
        .then(res => res.json())
        .then(json => {
          if (json.status === 'Success' && json.data?.songs) {
            setSongs(json.data.songs);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [album.id]);

  // Play a specific track
  const playTrack = (s) => {
    const link = s.download_url?.[0]?.link;
    if (!link) return;
    setVlcTrack({
      url: link,
      title: s.name,
      artist: s.primary_artists || s.subtitle || album.subtitle,
      artwork: s.image?.[0]?.link || album.image,
      duration: s.duration,
    });
  };

  // Render each song row
  const renderSong = ({ item }) => (
    <TouchableOpacity style={styles.songRow} onPress={() => playTrack(item)}>
      <Image source={{ uri: item.image?.[0]?.link }} style={styles.songArt} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle}>{item.name}</Text>
        <Text style={styles.songArtist}>{item.primary_artists || item.subtitle}</Text>
      </View>
      <Text style={styles.songDuration}>
        {item.duration 
          ? `${Math.floor(item.duration / 60)}:${String(item.duration % 60).padStart(2,'0')}` 
          : '--:--'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Nav Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={nav.goBack} style={styles.backBtn}>
          <Icon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.actions}>
          <Icon name="heart-outline" size={24} color="#fff" />
          <Icon name="share-outline" size={24} color="#fff" />
          <Icon name="ellipsis-vertical" size={24} color="#fff" />
        </View>
      </View>

      {/* Album Info */}
      <View style={styles.albumSection}>
        <Image source={{ uri: album.image }} style={styles.coverArt} />
        <Text style={styles.albumTitle}>{album.name}</Text>
        <Text style={styles.albumSub}>{album.subtitle}</Text>
        <Text style={styles.albumMeta}>
          {album.year || '—'} • {songs.length} songs
        </Text>
      </View>

      {/* Songs List */}
      {loading ? (
        <ActivityIndicator size="large" color="#1DB954" style={{ flex:1 }} />
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={s => s.id}
          contentContainerStyle={{ paddingBottom: vlcTrack ? 100 : 20 }}
        />
      )}

      {/* Mini Player (always at bottom, overlays content) */}
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
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#121212' },
  header: {
    flexDirection:'row', alignItems:'center',
    justifyContent:'space-between', padding:16
  },
  backBtn: { padding:8 },
  actions: { flexDirection:'row', width:100, justifyContent:'space-between' },

  albumSection: { alignItems:'center', padding:20 },
  coverArt: { width:200, height:200, borderRadius:8, marginBottom:16 },
  albumTitle: { color:'#fff', fontSize:24, fontWeight:'bold' },
  albumSub: { color:'#aaa', fontSize:16, marginTop:4 },
  albumMeta: { color:'#777', fontSize:14, marginTop:6 },

  songRow: {
    flexDirection:'row', alignItems:'center',
    padding:12, borderBottomWidth:1, borderColor:'#333'
  },
  songArt: { width:50, height:50, borderRadius:6, marginRight:12 },
  songInfo: { flex:1 },
  songTitle: { color:'#fff', fontSize:16 },
  songArtist: { color:'#aaa', fontSize:14, marginTop:2 },
  songDuration: { color:'#aaa', fontSize:14, width:50, textAlign:'right' },
});
