/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useRef, useState} from 'react';
import {Appearance, StyleSheet, View, Text} from 'react-native';
import {VolumeManager} from 'react-native-volume-manager';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/FontAwesome';
import {musicPlayerUI} from '../../styles/Styles';

const VolumeSlider = ({theme = 'light'}) => {
  const [volume, setVolume] = useState(0.5);
  const volumeManagerRef = useRef(null);

  useEffect(() => {
    // Initialize volume manager
    volumeManagerRef.current = VolumeManager;

    // Get initial volume
    const getInitialVolume = async () => {
      try {
        const initialVolume = await VolumeManager.getVolume();
        setVolume(initialVolume);
      } catch (error) {
        console.error('Error getting initial volume:', error);
      }
    };

    getInitialVolume();

    // Subscribe to volume changes
    const volumeListener = VolumeManager.addVolumeListener(result => {
      setVolume(result.volume);
    });

    return () => {
      // Clean up volume listener
      if (volumeListener && volumeListener.remove) {
        volumeListener.remove();
      }
    };
  }, []);

  const handleVolumeChange = async value => {
    try {
      setVolume(value);
      await VolumeManager.setVolume(value);
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  };

  return (
    <View style={musicPlayerUI.volumeContainer}>
      <Icon
        name="volume-down"
        size={16}
        color={theme === 'light' ? '#666' : '#BBBBBB'}
      />
      <Slider
        style={{width: '80%', height: 40}}
        minimumValue={0}
        maximumValue={1}
        value={volume}
        minimumTrackTintColor={theme === 'light' ? '#4D20AF' : '#7744CF'}
        maximumTrackTintColor={theme === 'light' ? '#dedede' : '#444444'}
        thumbTintColor={theme === 'light' ? '#7744CF' : '#9966FF'}
        onValueChange={handleVolumeChange}
      />
      <Icon
        name="volume-up"
        size={18}
        color={theme === 'light' ? '#666' : '#BBBBBB'}
      />
    </View>
  );
};

export default VolumeSlider;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 40,
    flexWrap: 'wrap',
  },
});
