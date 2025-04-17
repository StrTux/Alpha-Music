import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import apiService from '../../services/ApiService';
import MiniPlayer from '../playerTab/MiniPlayer';
import SongCard from '../../components/SongCard';
import AlbumCard from '../../components/AlbumCard';
import {useMusic} from '../../context/MusicContext';

const DiscoveryScreen = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [error, setError] = useState(null);
  const {currentTrack} = useMusic();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch real data without relying on mock data
      const homeDataResponse = await apiService.getHomeData();

      if (homeDataResponse.error) {
        console.error('Error fetching home data:', homeDataResponse.message);
        setError('Could not load music data. Please try again later.');
      } else if (homeDataResponse.data) {
        // Only update state if we got valid data
        if (
          homeDataResponse.data.trending &&
          homeDataResponse.data.trending.length > 0
        ) {
          setTrendingSongs(homeDataResponse.data.trending);
        }

        if (
          homeDataResponse.data.newReleases &&
          homeDataResponse.data.newReleases.length > 0
        ) {
          setNewReleases(homeDataResponse.data.newReleases);
        }
      }
    } catch (err) {
      console.error('Error fetching discovery data:', err);
      setError('Could not load music data. Please try again later.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleSongPress = song => {
    navigation.navigate('Player', {songId: song.id});
  };

  const handleAlbumPress = album => {
    navigation.navigate('AlbumDetails', {albumId: album.id});
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading music...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1DB954']}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Songs</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {trendingSongs.length > 0 ? (
              trendingSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPress={() => handleSongPress(song)}
                />
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>
                  No trending songs available
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>New Releases</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newReleases.length > 0 ? (
              newReleases.map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onPress={() => handleAlbumPress(album)}
                />
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No new releases available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      {currentTrack && <MiniPlayer />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
  },
  sectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noDataContainer: {
    width: 150,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginRight: 12,
  },
  noDataText: {
    color: '#aaa',
    textAlign: 'center',
    padding: 16,
  },
});

export default DiscoveryScreen;
