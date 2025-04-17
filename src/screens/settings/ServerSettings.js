import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../../context/AuthContext';
import ServerConfig, {
  POTENTIAL_ADDRESSES,
  loadApiUrl,
  saveApiUrl,
  checkServerUrl,
} from '../../utils/ServerConfig';

const ServerSettings = () => {
  const navigation = useNavigation();
  const {apiUrl, setCustomApiUrl} = useContext(AuthContext);

  const [serverAddress, setServerAddress] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [autoDiscovery, setAutoDiscovery] = useState(true);

  // Load current server address
  useEffect(() => {
    const loadSavedUrl = async () => {
      const savedUrl = await loadApiUrl();
      setServerAddress(savedUrl || '');
    };

    loadSavedUrl();
  }, []);

  // Auto-discover server
  const handleAutoDiscover = async () => {
    setIsDiscovering(true);
    setTestResults([]);

    try {
      const discoveredUrl = await ServerConfig.discoverServer();

      if (discoveredUrl) {
        setServerAddress(discoveredUrl);
        await setCustomApiUrl(discoveredUrl);
        setTestResults([
          {
            url: discoveredUrl,
            success: true,
            message: 'Auto-discovered and connected!',
          },
        ]);
        Alert.alert('Success', `Found server at: ${discoveredUrl}`, [
          {text: 'OK'},
        ]);
      } else {
        setTestResults([
          {url: 'Auto-discovery', success: false, message: 'No server found'},
        ]);
        Alert.alert(
          'Discovery Failed',
          'Could not find server automatically. Please enter address manually.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error during auto-discovery:', error);
      setTestResults([
        {url: 'Auto-discovery', success: false, message: error.message},
      ]);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Test server connection
  const handleTestConnection = async () => {
    if (!serverAddress) {
      Alert.alert('Error', 'Please enter a server address');
      return;
    }

    setIsTesting(true);
    setTestResults([]);

    try {
      // Format the URL correctly
      let url = serverAddress;
      if (!url.startsWith('http')) {
        url = `http://${url}`;
      }

      if (!url.includes(':3500')) {
        url = `${url}:3500`;
      }

      const isConnected = await checkServerUrl(url);

      if (isConnected) {
        setTestResults([
          {url, success: true, message: 'Connection successful!'},
        ]);
      } else {
        setTestResults([{url, success: false, message: 'Failed to connect'}]);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResults([
        {url: serverAddress, success: false, message: error.message},
      ]);
    } finally {
      setIsTesting(false);
    }
  };

  // Save server address
  const handleSaveAddress = async () => {
    if (!serverAddress) {
      Alert.alert('Error', 'Please enter a server address');
      return;
    }

    try {
      // Test connection first
      setIsTesting(true);

      let url = serverAddress;
      if (!url.startsWith('http')) {
        url = `http://${url}`;
      }

      if (!url.includes(':3500')) {
        url = `${url}:3500`;
      }

      const isConnected = await checkServerUrl(url);

      if (isConnected) {
        await saveApiUrl(url);
        await setCustomApiUrl(url);

        Alert.alert('Success', 'Server address saved successfully!', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert(
          'Warning',
          'Could not connect to this server. Do you still want to save this address?',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Save Anyway',
              onPress: async () => {
                await saveApiUrl(url);
                await setCustomApiUrl(url);
                navigation.goBack();
              },
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error saving address:', error);
      Alert.alert('Error', `Failed to save address: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Server Settings</Text>
      <Text style={styles.description}>
        Configure the connection to your music server
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Current Server Address</Text>
        <Text style={styles.currentAddress}>{apiUrl}</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Server Address</Text>
        <TextInput
          style={styles.input}
          value={serverAddress}
          onChangeText={setServerAddress}
          placeholder="E.g. 10.0.2.2 or 192.168.1.100"
          placeholderTextColor="#999"
        />
        <Text style={styles.hint}>
          For emulators, use 10.0.2.2 (Android) or localhost (iOS)
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleTestConnection}
          disabled={isTesting || isDiscovering}>
          {isTesting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Test Connection</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveAddress}
          disabled={isTesting || isDiscovering}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.discoverySection}>
        <Text style={styles.subtitle}>Auto-Discovery</Text>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Enable Auto-Discovery</Text>
          <Switch
            value={autoDiscovery}
            onValueChange={setAutoDiscovery}
            trackColor={{false: '#767577', true: '#5E35B1'}}
            thumbColor={autoDiscovery ? '#C73EFF' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.discoveryButton]}
          onPress={handleAutoDiscover}
          disabled={!autoDiscovery || isTesting || isDiscovering}>
          {isDiscovering ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Discover Server</Text>
          )}
        </TouchableOpacity>
      </View>

      {testResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.subtitle}>Connection Results</Text>
          {testResults.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultItem,
                result.success ? styles.successResult : styles.errorResult,
              ]}>
              <Text style={styles.resultUrl}>{result.url}</Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.possibleAddresses}>
        <Text style={styles.subtitle}>Common Server Addresses</Text>
        <Text style={styles.hint}>Tap an address to use it</Text>

        {POTENTIAL_ADDRESSES.map((address, index) => (
          <TouchableOpacity
            key={index}
            style={styles.addressItem}
            onPress={() => setServerAddress(address)}>
            <Text style={styles.addressText}>{address}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    marginTop: 24,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  currentAddress: {
    fontSize: 15,
    color: '#C73EFF',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#444',
    padding: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#C73EFF',
  },
  discoveryButton: {
    backgroundColor: '#5E35B1',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  discoverySection: {
    marginTop: 8,
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  resultsContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  resultItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  successResult: {
    backgroundColor: 'rgba(46, 125, 50, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.5)',
  },
  errorResult: {
    backgroundColor: 'rgba(198, 40, 40, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(198, 40, 40, 0.5)',
  },
  resultUrl: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultMessage: {
    color: '#ccc',
    fontSize: 14,
  },
  possibleAddresses: {
    marginBottom: 36,
  },
  addressItem: {
    padding: 12,
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressText: {
    color: '#C73EFF',
    fontSize: 14,
  },
});

export default ServerSettings;
