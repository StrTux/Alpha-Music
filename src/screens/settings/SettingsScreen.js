import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../../context/AuthContext';
import {useMusic} from '../../context/MusicContext';
import MiniPlayer from '../playerTab/MiniPlayer';


const SettingsScreen = () => {
  const navigation = useNavigation();
  const {userToken, userInfo, logout} = useContext(AuthContext);
  const {currentTrack, setQuality, getCurrentQuality} = useMusic();

  // State variables
  const [audioQuality, setAudioQuality] = useState('320kbps');
  const [downloadQuality, setDownloadQuality] = useState('320kbps');
  const [wifiOnlyDownload, setWifiOnlyDownload] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showDownloadQualityModal, setShowDownloadQualityModal] =
    useState(false);
  const [currentModalMode, setCurrentModalMode] = useState('streaming');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [downloadPath, setDownloadPath] = useState('/Music');
  const [showDownloadPathModal, setShowDownloadPathModal] = useState(false);
  const [newDownloadPath, setNewDownloadPath] = useState('/Music');
  const [cacheSize, setCacheSize] = useState('235 MB');
  const [storageInfo, setStorageInfo] = useState({
    total: '64 GB',
    free: '32 GB',
    used: '32 GB',
    musicDownloads: '2.1 GB',
  });

  // Audio quality options
  const qualityOptions = [
    {label: 'Low (96kbps)', value: '96kbps'},
    {label: 'Medium (160kbps)', value: '160kbps'},
    {label: 'High (320kbps)', value: '320kbps'},
  ];

  // Load user settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  // Function to load user settings from storage
  const loadUserSettings = async () => {
    try {
      // In a real app, this would load from API or AsyncStorage
      const streamingQuality = await AsyncStorage.getItem('streamingQuality');
      const downloading = await AsyncStorage.getItem('downloadQuality');
      const wifiOnly = await AsyncStorage.getItem('wifiOnlyDownload');
      const autoDL = await AsyncStorage.getItem('autoDownload');
      const push = await AsyncStorage.getItem('pushNotifications');
      const email = await AsyncStorage.getItem('emailNotifications');
      const dlPath = await AsyncStorage.getItem('downloadPath');

      if (streamingQuality) {
        setAudioQuality(streamingQuality);
      }
      if (downloading) {
        setDownloadQuality(downloading);
      }
      if (wifiOnly !== null) {
        setWifiOnlyDownload(wifiOnly === 'true');
      }
      if (autoDL !== null) {
        setAutoDownload(autoDL === 'true');
      }
      if (push !== null) {
        setPushNotifications(push === 'true');
      }
      if (email !== null) {
        setEmailNotifications(email === 'true');
      }
      if (dlPath) {
        setDownloadPath(dlPath);
      }

      // If we have the quality in the MusicContext, use that
      const contextQuality = getCurrentQuality();
      if (contextQuality) {
        setAudioQuality(contextQuality);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Function to save user settings to storage
  const saveUserSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(
        key,
        typeof value === 'string' ? value : String(value),
      );
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // Handle audio quality change
  const handleQualityChange = quality => {
    setAudioQuality(quality);
    saveUserSettings('streamingQuality', quality);
    setQuality(quality); // Update the quality in MusicContext
    setShowQualityModal(false);
  };

  // Handle download quality change
  const handleDownloadQualityChange = quality => {
    setDownloadQuality(quality);
    saveUserSettings('downloadQuality', quality);
    setShowDownloadQualityModal(false);
  };

  // Handle toggle changes
  const handleWifiOnlyToggle = value => {
    setWifiOnlyDownload(value);
    saveUserSettings('wifiOnlyDownload', value);
  };

  const handleAutoDownloadToggle = value => {
    setAutoDownload(value);
    saveUserSettings('autoDownload', value);
  };

  const handlePushNotificationsToggle = value => {
    setPushNotifications(value);
    saveUserSettings('pushNotifications', value);
  };

  const handleEmailNotificationsToggle = value => {
    setEmailNotifications(value);
    saveUserSettings('emailNotifications', value);
  };

  // Handle download path change
  const handleDownloadPathChange = () => {
    setDownloadPath(newDownloadPath);
    saveUserSettings('downloadPath', newDownloadPath);
    setShowDownloadPathModal(false);
  };

  // Handle clear cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear the cache? This will not affect your downloaded music.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear the cache
            setCacheSize('0 MB');
            Alert.alert('Success', 'Cache has been cleared');
          },
        },
      ],
    );
  };

  // Navigate to Audio Settings
  const goToAudioSettings = () => {
    navigation.navigate('AudioSettings');
  };

  // Navigate to Server Settings
  const goToServerSettings = () => {
    // In a real app, this might be restricted to admin users
    navigation.navigate('ServerSettings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Audio Quality Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setCurrentModalMode('streaming');
              setShowQualityModal(true);
            }}>
            <Text style={styles.settingLabel}>Streaming Quality</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{audioQuality}</Text>
              <Icon name="chevron-forward" size={18} color="#777777" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setCurrentModalMode('download');
              setShowDownloadQualityModal(true);
            }}>
            <Text style={styles.settingLabel}>Download Quality</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{downloadQuality}</Text>
              <Icon name="chevron-forward" size={18} color="#777777" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={goToAudioSettings}>
            <Text style={styles.settingLabel}>Advanced Audio Settings</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>
        </View>

        {/* Downloads Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloads</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Download on Wi-Fi Only</Text>
            <Switch
              value={wifiOnlyDownload}
              onValueChange={handleWifiOnlyToggle}
              trackColor={{false: '#444', true: '#1DB954'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-download Liked Music</Text>
            <Switch
              value={autoDownload}
              onValueChange={handleAutoDownloadToggle}
              trackColor={{false: '#444', true: '#1DB954'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowDownloadPathModal(true)}>
            <Text style={styles.settingLabel}>Download Location</Text>
            <View style={styles.settingValueContainer}>
              <Text style={styles.settingValue}>{downloadPath}</Text>
              <Icon name="chevron-forward" size={18} color="#777777" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <View style={styles.storageInfo}>
            <View style={styles.storageBar}>
              <View style={[styles.storageUsed, {width: '50%'}]} />
            </View>
            <Text style={styles.storageText}>
              {storageInfo.used} used of {storageInfo.total} •{' '}
              {storageInfo.free} free
            </Text>
          </View>

          <View style={styles.storageDetails}>
            <View style={styles.storageDetail}>
              <MaterialIcon name="music-note" size={24} color="#1DB954" />
              <View style={styles.storageDetailText}>
                <Text style={styles.storageDetailTitle}>Music Downloads</Text>
                <Text style={styles.storageDetailValue}>
                  {storageInfo.musicDownloads}
                </Text>
              </View>
            </View>

            <View style={styles.storageDetail}>
              <MaterialIcon name="cached" size={24} color="#E91E63" />
              <View style={styles.storageDetailText}>
                <Text style={styles.storageDetailTitle}>Cache</Text>
                <Text style={styles.storageDetailValue}>{cacheSize}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleClearCache}>
            <Text style={styles.buttonText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={pushNotifications}
              onValueChange={handlePushNotificationsToggle}
              trackColor={{false: '#444', true: '#1DB954'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Switch
              value={emailNotifications}
              onValueChange={handleEmailNotificationsToggle}
              trackColor={{false: '#444', true: '#1DB954'}}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.settingLabel}>Edit Profile</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Settings</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>
        </View>

        {/* Advanced Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={goToServerSettings}>
            <Text style={styles.settingLabel}>Server Settings</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>About</Text>
            <Icon name="chevron-forward" size={18} color="#777777" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => logout()}>
          <Icon name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>App Version 1.0.0</Text>

        {/* Bottom padding for mini player */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Audio Quality Modal */}
      <Modal
        visible={showQualityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowQualityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Streaming Quality</Text>
            <View style={styles.modalOptions}>
              {qualityOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    audioQuality === option.value && styles.selectedOption,
                  ]}
                  onPress={() => handleQualityChange(option.value)}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      audioQuality === option.value &&
                        styles.selectedOptionText,
                    ]}>
                    {option.label}
                  </Text>
                  {audioQuality === option.value && (
                    <MaterialIcon name="check" size={20} color="#1DB954" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalNote}>
              Higher quality uses more data. When on cellular network, consider
              using lower quality.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQualityModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Download Quality Modal */}
      <Modal
        visible={showDownloadQualityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDownloadQualityModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Download Quality</Text>
            <View style={styles.modalOptions}>
              {qualityOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    downloadQuality === option.value && styles.selectedOption,
                  ]}
                  onPress={() => handleDownloadQualityChange(option.value)}>
                  <Text
                    style={[
                      styles.modalOptionText,
                      downloadQuality === option.value &&
                        styles.selectedOptionText,
                    ]}>
                    {option.label}
                  </Text>
                  {downloadQuality === option.value && (
                    <MaterialIcon name="check" size={20} color="#1DB954" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalNote}>
              Higher quality uses more storage space. A 3-minute song uses
              approximately 2.4MB at low quality, 4MB at medium quality, and
              7.2MB at high quality.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDownloadQualityModal(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Download Path Modal */}
      <Modal
        visible={showDownloadPathModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDownloadPathModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Download Location</Text>
            <TextInput
              style={styles.input}
              value={newDownloadPath}
              onChangeText={setNewDownloadPath}
              placeholder="Enter download path"
              placeholderTextColor="#777"
            />
            <Text style={styles.modalNote}>
              This is where your downloaded music will be stored on your device.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setNewDownloadPath(downloadPath);
                  setShowDownloadPathModal(false);
                }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleDownloadPathChange}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mini Player */}
      {currentTrack && <MiniPlayer />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2A2A2A',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    color: '#AAAAAA',
    fontSize: 16,
    marginRight: 8,
  },
  storageInfo: {
    padding: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 4,
  },
  storageText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  storageDetails: {
    padding: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  storageDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageDetailText: {
    marginLeft: 12,
  },
  storageDetailTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  storageDetailValue: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 2,
  },
  button: {
    backgroundColor: '#333',
    borderRadius: 4,
    margin: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 8,
    margin: 16,
    padding: 14,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  versionText: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  bottomPadding: {
    height: 80, // For mini player
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalOptions: {
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  selectedOption: {
    borderLeftColor: '#1DB954',
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  modalNote: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  modalCloseButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 4,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 12,
    padding: 8,
  },
  cancelButtonText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#1DB954',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
