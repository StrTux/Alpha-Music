import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Appearance,
  StyleSheet,
} from 'react-native';
import React, {useState, useContext} from 'react';
import {profileUI} from '../../styles/Styles';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {dmProfileUI} from '../../styles/DarkMode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';

const Profile = () => {
  const {logout, apiUrl, networkConnected} = useContext(AuthContext);
  const navigation = useNavigation();
  const [name, setName] = useState('');

  const [theme, setTheme] = useState(Appearance.getColorScheme());

  Appearance.addChangeListener(scheme => {
    setTheme(scheme.colorScheme);
  });

  const user = {
    avatar: require('../../../assets/default-imgs/default-pfp.png'),
    coverPhoto: require('../../../assets/default-imgs/default-cover-2.jpg'),
  };

  AsyncStorage.getItem('username').then(username => {
    setName(username);
  });

  return (
    <ScrollView
      style={theme === 'light' ? profileUI.container : dmProfileUI.container}>
      <Image source={user.coverPhoto} style={profileUI.coverPhoto} />
      <SafeAreaView style={profileUI.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('Library')}>
          <Icon
            name="arrow-back"
            size={30}
            color={theme === 'light' ? 'black' : 'white'}
          />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={profileUI.avatarContainer}>
        <TouchableOpacity onPress={() => {}}>
          <Image source={user.avatar} style={profileUI.avatar} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={theme === 'light' ? profileUI.name : dmProfileUI.name}>
            @{name}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={profileUI.statsContainer}>
        <View style={profileUI.statContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Text
              style={
                theme === 'light' ? profileUI.statCount : dmProfileUI.statCount
              }>
              0
            </Text>
          </TouchableOpacity>
          <Text style={profileUI.statLabel}>Total Songs</Text>
        </View>
        <View style={profileUI.statContainer}>
          <TouchableOpacity onPress={() => {}}>
            <Text
              style={
                theme === 'light' ? profileUI.statCount : dmProfileUI.statCount
              }>
              0
            </Text>
          </TouchableOpacity>
          <Text style={profileUI.statLabel}>Hours{'\n'}Listened</Text>
        </View>
      </View>

      <View style={profileUI.section}>
        <View style={profileUI.sectionHeader}>
          <Text
            style={
              theme === 'light'
                ? profileUI.sectionTitle
                : dmProfileUI.sectionTitle
            }>
            Your Songs:
          </Text>
          <TouchableOpacity style={profileUI.seeAllButton} onPress={() => {}}>
            <Text style={profileUI.seeAllButtonText}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Server Settings Section */}
      <View style={styles.settingsSection}>
        <Text
          style={
            theme === 'light'
              ? profileUI.sectionTitle
              : dmProfileUI.sectionTitle
          }>
          Settings
        </Text>

        <TouchableOpacity
          style={styles.settingsItem}
          onPress={() => navigation.navigate('ServerSettings')}>
          <View style={styles.settingsItemContent}>
            <MaterialCommunityIcons
              name="server-network"
              size={24}
              color={networkConnected ? '#4CAF50' : '#F44336'}
            />
            <View style={styles.settingsItemText}>
              <Text
                style={
                  theme === 'light'
                    ? styles.settingsItemTitle
                    : styles.settingsItemTitleDark
                }>
                Server Settings
              </Text>
              <Text style={styles.settingsItemSubtitle}>
                {networkConnected ? 'Connected' : 'Disconnected'} - {apiUrl}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <View style={profileUI.logOutContainer}>
        <TouchableOpacity
          onPress={() =>
            Alert.alert('Logout', 'Are you sure you wish to logout?', [
              {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel',
              },
              {
                text: 'Logout',
                onPress: () => {
                  logout();
                },
              },
            ])
          }>
          <Text style={profileUI.logOutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  settingsSection: {
    padding: 16,
    marginTop: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsItemText: {
    marginLeft: 16,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  settingsItemTitleDark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  settingsItemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default Profile;
