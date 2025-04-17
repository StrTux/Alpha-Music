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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AuthContext} from '../../context/AuthContext';

const LoginScreen = () => {
  const navigation = useNavigation();
  const {
    login,
    error: authError,
    isLoading,
    checkServerConnection,
  } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [connectionError, setConnectionError] = useState(false);
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
      const isConnected = await checkServerConnection();
      setConnectionError(!isConnected);
    };
    checkConnection();
  }, [checkServerConnection]);

  const validateForm = () => {
    setValidationError('');

    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }

    if (!password.trim()) {
      setValidationError('Password is required');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Attempting login with:', {email});

      // Check server connection first
      const isConnected = await checkServerConnection();

      if (!isConnected) {
        setValidationError(
          'Unable to connect to the server. Please check your internet connection and try again.',
        );
        return;
      }

      await login(email, password);
      console.log('Login successful!');
      // Successfully logged in via the AuthContext
    } catch (error) {
      console.error('Login error in component:', error);
      // If there's a network error, show a more helpful message
      if (!error.response) {
        setValidationError(
          'Network error. Please check your internet connection and try again.',
        );
      }
      // Error is already set in the AuthContext
    }
  };

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Welcome back to Alpha Music</Text>

      {connectionError && (
        <View style={styles.connectionErrorContainer}>
          <Text style={styles.errorText}>
            Unable to connect to server. Please check your internet connection
            and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={async () => {
              const isConnected = await checkServerConnection();
              setConnectionError(!isConnected);
            }}>
            <Text style={styles.retryText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Show validation error or auth error */}
      {(validationError || authError) && !connectionError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{validationError || authError}</Text>
        </View>
      )}

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
          placeholder="Enter your password"
          placeholderTextColor="#999"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
        />
      </View>

      <TouchableOpacity style={styles.forgotPassword}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.loginText}>Login</Text>
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

      <View style={styles.createAccountRow}>
        <Text style={styles.createAccountText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Create Account')}>
          <Text style={styles.createAccountLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#999',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  loginText: {
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
  createAccountRow: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createAccountText: {
    color: '#999',
    fontSize: 14,
  },
  createAccountLink: {
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
  retryButton: {
    backgroundColor: 'rgba(250, 250, 250, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
