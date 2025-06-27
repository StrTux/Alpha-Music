import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useMusic } from '../../context/MusicContext';
import MiniPlayer from '../playerTab/MiniPlayer';

const ProfileScreen = () => {
  const { currentTrack } = useMusic();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Icon name="person" size={60} color="#888888" />
            </View>
          </View>
          <Text style={styles.profileName}>User Name</Text>
          <Text style={styles.profileStats}>1 Playlist • 25 Followers • 12 Following</Text>
        </View>
        
        {/* Profile actions */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="pencil-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="share-social-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share Profile</Text>
          </TouchableOpacity>
        </View>
        
        {/* Your Music */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Your Music</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="heart" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Liked Songs</Text>
              <Text style={styles.menuItemSubtitle}>134 songs</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="albums" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Your Playlists</Text>
              <Text style={styles.menuItemSubtitle}>6 playlists</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="download" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Downloaded Music</Text>
              <Text style={styles.menuItemSubtitle}>45 songs</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
        </View>
        
        {/* Account */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="person-circle" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Account Settings</Text>
              <Text style={styles.menuItemSubtitle}>Profile, Email, Password</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="notifications" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>Manage preferences</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="shield-checkmark" size={24} color="#1DB954" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Privacy & Security</Text>
              <Text style={styles.menuItemSubtitle}>Manage data and privacy settings</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="log-out" size={24} color="#FF3B30" style={styles.menuItemIcon} />
            <View style={styles.menuItemContent}>
              <Text style={[styles.menuItemTitle, { color: '#FF3B30' }]}>Log Out</Text>
            </View>
            <Icon name="chevron-forward" size={24} color="#AAAAAA" />
          </TouchableOpacity>
        </View>
        
        {/* Space for mini player */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Mini Player */}
      {currentTrack && <MiniPlayer />}
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  profileInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileStats: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#333333',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuItemIcon: {
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  bottomPadding: {
    height: 80,
  },
});

export default ProfileScreen;
