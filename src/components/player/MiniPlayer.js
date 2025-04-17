import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMusic} from '../../context/MusicContext';
import PlayerControls from './PlayerControls';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const MiniPlayer = () => {
  const navigation = useNavigation();
  const {currentTrack, isLoading, isPlayerError, resetPlayer} = useMusic();

  // Don't show anything if no track is loaded
  if (!currentTrack) {
    return null;
  }

  // Handle tap on the mini player to navigate to full player
  const handlePress = () => {
    navigation.navigate('Player');
  };

  // Format title/artist if they're too long
  const formatText = (text, maxLength = 25) => {
    if (!text) {
      return '';
    }
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Handle player error recovery
  const handleResetPlayer = () => {
    if (resetPlayer) {
      resetPlayer();
    }
  };

  // If there's a player error, show a simplified mini player with reset option
  if (isPlayerError) {
    return (
      <LinearGradient colors={['#661111', '#330000']} style={styles.container}>
        <View style={styles.contentContainer}>
          <Icon
            name="alert-circle"
            size={24}
            color="#FFFFFF"
            style={styles.errorIcon}
          />

          <View style={styles.textContainer}>
            <Text style={styles.errorText}>Playback Error</Text>
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPlayer}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#333333', '#111111']} style={styles.container}>
      <TouchableOpacity
        style={styles.contentContainer}
        onPress={handlePress}
        activeOpacity={0.8}>
        {/* Track artwork */}
        <Image
          source={
            currentTrack.artwork
              ? {uri: currentTrack.artwork}
              : {uri: 'https://via.placeholder.com/50/232323/FFFFFF?text=Music'}
          }
          style={styles.artwork}
        />

        {/* Track info */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {formatText(currentTrack.title)}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {formatText(currentTrack.artist)}
          </Text>
        </View>

        {/* Player controls */}
        <View style={styles.controlsContainer}>
          <PlayerControls mini={true} theme="dark" />
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#222222',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: '#AAAAAA',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: width * 0.35,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#661111',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MiniPlayer;
