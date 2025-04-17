import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import NetInfo with a try/catch to handle potential missing module
let NetInfo;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch (error) {
  console.warn(
    'NetInfo module not available, network connectivity features will be disabled',
  );
}
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ServerSettings = ({navigation}) => {
  const {networkConnected, BASE_URL, updateServerSettings} =
    useContext(AuthContext);
  const [serverAddress, setServerAddress] = useState('');
  const [isAutoDiscoveryEnabled, setIsAutoDiscoveryEnabled] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredServers, setDiscoveredServers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  useEffect(() => {
    // Load current server address and auto-discovery setting
    const loadSettings = async () => {
      try {
        const savedAddress = await AsyncStorage.getItem('serverAddress');
        const autoDiscovery = await AsyncStorage.getItem('autoDiscovery');

        if (savedAddress) {
          setServerAddress(savedAddress);
        } else {
          setServerAddress(BASE_URL || 'http://localhost:3000');
        }

        setIsAutoDiscoveryEnabled(autoDiscovery !== 'false');
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading server settings:', error);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [BASE_URL]);

  const saveServerAddress = async () => {
    if (!serverAddress.trim()) {
      Alert.alert('Error', 'Please enter a server address');
      return;
    }

    try {
      setIsLoading(true);

      // Format URL properly
      let formattedUrl = serverAddress.trim();
      if (
        !formattedUrl.startsWith('http://') &&
        !formattedUrl.startsWith('https://')
      ) {
        formattedUrl = `http://${formattedUrl}`;
      }

      // Remove trailing slash if present
      if (formattedUrl.endsWith('/')) {
        formattedUrl = formattedUrl.slice(0, -1);
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem('serverAddress', formattedUrl);
      await AsyncStorage.setItem(
        'autoDiscovery',
        isAutoDiscoveryEnabled.toString(),
      );

      // Update context
      updateServerSettings(formattedUrl, isAutoDiscoveryEnabled);

      setServerAddress(formattedUrl);
      Alert.alert('Success', 'Server address saved successfully');

      setIsLoading(false);
    } catch (error) {
      console.error('Error saving server address:', error);
      Alert.alert('Error', 'Failed to save server address: ' + error.message);
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setTestStatus('testing');

      // Format URL properly
      let formattedUrl = serverAddress.trim();
      if (
        !formattedUrl.startsWith('http://') &&
        !formattedUrl.startsWith('https://')
      ) {
        formattedUrl = `http://${formattedUrl}`;
      }

      // Ping server with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${formattedUrl}/api/ping`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setTestStatus('success');
        Alert.alert('Success', 'Connection to server successful!');
      } else {
        setTestStatus('error');
        Alert.alert('Error', `Server returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestStatus('error');
      Alert.alert(
        'Connection Error',
        `Could not connect to server: ${error.message}`,
      );
    }
  };

  const discoverServers = async () => {
    setIsDiscovering(true);
    setDiscoveredServers([]);

    try {
      // Check if NetInfo is available
      if (!NetInfo) {
        Alert.alert(
          'Not Available',
          'Network discovery is not available in this version',
        );
        setIsDiscovering(false);
        return;
      }

      // Get current network info
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        Alert.alert('Not Connected', 'No network connection available');
        setIsDiscovering(false);
        return;
      }

      // Common local network patterns to check
      const possibleServers = [];

      // Add localhost variants
      possibleServers.push('http://localhost:3000');
      possibleServers.push('http://127.0.0.1:3000');

      // For Android emulator
      possibleServers.push('http://10.0.2.2:3000');

      // For common local IPs
      for (let i = 1; i < 255; i++) {
        // Only check a few common IPs to avoid long discovery times
        if (i === 1 || i === 100 || i === 254) {
          possibleServers.push(`http://192.168.1.${i}:3000`);
        }
      }

      // Check common local network addresses
      const discoveredList = [];
      const timeout = 1000; // 1 second timeout for each ping

      for (const server of possibleServers) {
        try {
          // Use Promise.race to implement timeout
          const pingPromise = fetch(`${server}/api/ping`);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), timeout),
          );

          const response = await Promise.race([pingPromise, timeoutPromise]);

          if (response.ok) {
            discoveredList.push(server);
            // Add to the list as we find them
            setDiscoveredServers([...discoveredList]);
          }
        } catch (error) {
          // Skip this server if it times out or has an error
          console.log(`Server ${server} not available:`, error.message);
        }
      }

      if (discoveredList.length === 0) {
        Alert.alert(
          'No Servers Found',
          'Could not discover any servers on the network',
        );
      }
    } catch (error) {
      console.error('Error discovering servers:', error);
      Alert.alert(
        'Discovery Error',
        `Failed to discover servers: ${error.message}`,
      );
    } finally {
      setIsDiscovering(false);
    }
  };

  const resetToDefault = async () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset to default server settings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: async () => {
            try {
              setIsLoading(true);

              // Platform specific default
              const defaultServer = 'http://localhost:3000';

              await AsyncStorage.setItem('serverAddress', defaultServer);
              await AsyncStorage.setItem('autoDiscovery', 'true');

              setServerAddress(defaultServer);
              setIsAutoDiscoveryEnabled(true);
              updateServerSettings(defaultServer, true);

              Alert.alert('Success', 'Settings have been reset to default');
              setIsLoading(false);
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert(
                'Error',
                'Failed to reset settings: ' + error.message,
              );
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const selectDiscoveredServer = server => {
    setServerAddress(server);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C73EFF" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Server Settings</Text>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name={networkConnected ? 'wifi-check' : 'wifi-off'}
            size={24}
            color={networkConnected ? '#4CAF50' : '#F44336'}
          />
          <Text
            style={
              networkConnected
                ? styles.statusConnected
                : styles.statusDisconnected
            }>
            {networkConnected
              ? 'Connected to network'
              : 'No network connection'}
          </Text>
        </View>

        <View style={styles.statusRow}>
          <MaterialCommunityIcons
            name="server"
            size={24}
            color={testStatus === 'success' ? '#4CAF50' : '#757575'}
          />
          <Text style={styles.serverStatus}>
            Current server: {serverAddress || 'Not set'}
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Server Configuration</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Server Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter server address (e.g., 192.168.1.100:3000)"
            value={serverAddress}
            onChangeText={setServerAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            Auto-discover server on startup
          </Text>
          <Switch
            value={isAutoDiscoveryEnabled}
            onValueChange={setIsAutoDiscoveryEnabled}
            trackColor={{false: '#767577', true: '#C73EFF'}}
            thumbColor={isAutoDiscoveryEnabled ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Advanced mode</Text>
          <Switch
            value={isAdvancedMode}
            onValueChange={setIsAdvancedMode}
            trackColor={{false: '#767577', true: '#C73EFF'}}
            thumbColor={isAdvancedMode ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        {isAdvancedMode && (
          <View style={styles.advancedSection}>
            <Text style={styles.advancedNote}>
              Note: Only change these settings if you know what you're doing.
            </Text>

            {/* Additional advanced settings could go here */}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={saveServerAddress}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={testConnection}
          disabled={testStatus === 'testing'}>
          {testStatus === 'testing' ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Test Connection</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.discoverySection}>
        <Text style={styles.sectionTitle}>Server Discovery</Text>

        <TouchableOpacity
          style={[styles.button, styles.discoveryButton]}
          onPress={discoverServers}
          disabled={isDiscovering}>
          {isDiscovering ? (
            <View style={styles.discoveryButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Discovering...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Discover Servers</Text>
          )}
        </TouchableOpacity>

        {discoveredServers.length > 0 && (
          <View style={styles.discoveredServersContainer}>
            <Text style={styles.discoveredTitle}>Discovered Servers:</Text>
            {discoveredServers.map((server, index) => (
              <TouchableOpacity
                key={index}
                style={styles.discoveredServer}
                onPress={() => selectDiscoveredServer(server)}>
                <MaterialCommunityIcons
                  name="server"
                  size={20}
                  color="#C73EFF"
                />
                <Text style={styles.discoveredServerText}>{server}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.resetSection}>
        <TouchableOpacity style={styles.resetButton} onPress={resetToDefault}>
          <Text style={styles.resetButtonText}>Reset to Default</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  header: {
    padding: 16,
    backgroundColor: '#C73EFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statusSection: {
    margin: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  formSection: {
    margin: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  discoverySection: {
    margin: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  resetSection: {
    margin: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusConnected: {
    marginLeft: 8,
    color: '#4CAF50',
    fontSize: 16,
  },
  statusDisconnected: {
    marginLeft: 8,
    color: '#F44336',
    fontSize: 16,
  },
  serverStatus: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f5f5f5',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#555',
  },
  advancedSection: {
    marginVertical: 12,
    padding: 8,
    backgroundColor: '#FFF9C4',
    borderRadius: 4,
  },
  advancedNote: {
    fontSize: 14,
    color: '#FF6F00',
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#C73EFF',
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  testButton: {
    backgroundColor: '#7B1FA2',
  },
  discoveryButton: {
    backgroundColor: '#4527A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  discoveryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveredServersContainer: {
    marginTop: 16,
  },
  discoveredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  discoveredServer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  discoveredServerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 4,
  },
  resetButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ServerSettings;
