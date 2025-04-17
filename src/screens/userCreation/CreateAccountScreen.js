import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AuthContext} from '../../context/AuthContext';
import ServerConfig from '../../utils/ServerConfig';

const CreateAccountScreen = () => {
  const navigation = useNavigation();
  const {
    register,
    error: authError,
    isLoading,
    checkServerConnection,
    setCustomApiUrl,
    networkConnected,
  } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [isDiscoveringServer, setIsDiscoveringServer] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [serverAddress, setServerAddress] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Check server connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionError(false);
      const isConnected = await checkServerConnection();
      setConnectionError(!isConnected);

      // If not connected, load current server address for the settings
      if (!isConnected) {
        const currentUrl = await ServerConfig.loadApiUrl();
        setServerAddress(currentUrl);
      }
    };

    checkConnection();
  }, [checkServerConnection]);

  const validateForm = () => {
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError('Full name is required');
      return false;
    }

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!password.trim()) {
      setValidationError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleCreateAccount = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Attempting registration with:', {username: fullName, email});

      // Check server connection first
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setConnectionError(true);
        setValidationError(
          'Unable to connect to the server. Please check your internet connection and try again.',
        );
        return;
      }

      await register(fullName, email, password);
      // Registration successful, user will be logged in via the AuthContext
      console.log('Registration successful!');
    } catch (error) {
      console.error('Registration error in component:', error);
      // If there's a network error, show a more helpful message
      if (!error.response) {
        setValidationError(
          'Network error. Please check your internet connection and try again.',
        );
      }
      // Error is already set in the AuthContext
    }
  };

  const handleAutoDiscover = async () => {
    setIsDiscoveringServer(true);
    try {
      const discoveredUrl = await ServerConfig.discoverServer();

      if (discoveredUrl) {
        await setCustomApiUrl(discoveredUrl);
        setConnectionError(false);
        Alert.alert('Success', `Found server at: ${discoveredUrl}`, [
          {text: 'OK'},
        ]);
      } else {
        Alert.alert(
          'Discovery Failed',
          'Could not find server automatically. Please enter address manually.',
          [{text: 'OK', onPress: () => setShowServerSettings(true)}],
        );
      }
    } catch (error) {
      console.error('Error during auto-discovery:', error);
      Alert.alert('Error', 'Failed to discover server: ' + error.message, [
        {text: 'OK'},
      ]);
    } finally {
      setIsDiscoveringServer(false);
    }
  };

  const handleSaveServerAddress = async () => {
    if (!serverAddress) {
      Alert.alert('Error', 'Please enter a server address');
      return;
    }

    try {
      await setCustomApiUrl(serverAddress);
      setShowServerSettings(false);

      // Check if the new server is reachable
      const isConnected = await checkServerConnection();
      setConnectionError(!isConnected);

      if (isConnected) {
        Alert.alert('Success', 'Connected to server successfully!');
      }
    } catch (error) {
      console.error('Error saving server address:', error);
      Alert.alert('Error', 'Failed to save server address: ' + error.message);
    }
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Alpha Music today</Text>

      {connectionError && (
        <View style={styles.connectionErrorContainer}>
          <Text style={styles.errorText}>
            Unable to connect to server. Please check your internet connection
            and try again.
          </Text>
          <View style={styles.connectionButtonsRow}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                const isConnected = await checkServerConnection();
                setConnectionError(!isConnected);
              }}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retryButton, styles.discoverButton]}
              onPress={handleAutoDiscover}
              disabled={isDiscoveringServer || !networkConnected}>
              {isDiscoveringServer ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.retryText}>Auto-Discover</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.retryButton, styles.settingsButton]}
              onPress={() => setShowServerSettings(true)}>
              <Text style={styles.retryText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Show validation error or auth error */}
      {(validationError || authError) && !connectionError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError || authError}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          placeholder="John Doe"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="email@example.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Create a strong password"
          placeholderTextColor="#999"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          placeholder="Confirm your password"
          placeholderTextColor="#999"
          value={confirmPassword}
          secureTextEntry
          onChangeText={setConfirmPassword}
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateAccount}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.createText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="apple" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="google" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Icon name="facebook" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login Screen')}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Server Settings Modal */}
      <Modal
        visible={showServerSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServerSettings(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Settings</Text>
              <TouchableOpacity
                onPress={() => setShowServerSettings(false)}
                style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Server Address</Text>
            <TextInput
              style={styles.modalInput}
              value={serverAddress}
              onChangeText={setServerAddress}
              placeholder="E.g. 10.0.2.2 or 192.168.1.100"
              placeholderTextColor="#999"
            />
            <Text style={styles.modalHint}>
              For emulators, use 10.0.2.2 (Android) or localhost (iOS)
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowServerSettings(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveServerAddress}>
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: '#999',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(200, 50, 50, 0.1)',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 50, 50, 0.3)',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 0.6,
    borderColor: 'rgba(250, 250, 250, 0.5)',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    height: 50,
  },
  createText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#999',
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 0.6,
    borderColor: 'rgba(250, 250, 250, 0.5)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginRow: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: '#999',
    fontSize: 14,
  },
  loginLink: {
    color: '#fff',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  connectionErrorContainer: {
    backgroundColor: 'rgba(200, 50, 50, 0.1)',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(200, 50, 50, 0.3)',
    alignItems: 'center',
  },
  connectionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  discoverButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
  },
  settingsButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    backgroundColor: '#000',
    borderWidth: 0.6,
    borderColor: 'rgba(250, 250, 250, 0.5)',
    color: '#fff',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
  },
  modalHint: {
    color: '#999',
    fontSize: 12,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    padding: 14,
    borderRadius: 5,
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'rgba(200, 50, 50, 0.8)',
  },
  saveButton: {
    backgroundColor: 'rgba(50, 200, 50, 0.8)',
  },
});

export default CreateAccountScreen;
