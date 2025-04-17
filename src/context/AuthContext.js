import React, {createContext, useState, useEffect, useContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  // Load stored authentication state on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        setIsLoading(true);
        const storedToken = await AsyncStorage.getItem('userToken');
        const storedUserInfo = await AsyncStorage.getItem('userInfo');

        if (storedToken) {
          setUserToken(storedToken);

          if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
          }
        }
      } catch (loadError) {
        console.error('Error loading authentication data:', loadError);
        setError('Failed to load authentication data');
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, you would perform API authentication here
      // For now, we'll simulate a successful login with fake data
      const fakeToken = 'fake-auth-token';
      const fakeUserInfo = {
        id: '1',
        username: username,
        name: 'Demo User',
        email: `${username}@example.com`,
      };

      // Store authentication data
      await AsyncStorage.setItem('userToken', fakeToken);
      await AsyncStorage.setItem('userInfo', JSON.stringify(fakeUserInfo));

      // Update state
      setUserToken(fakeToken);
      setUserInfo(fakeUserInfo);

      return true;
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError(loginError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, you would perform API registration here
      // For now, we'll simulate a successful registration with fake data
      const fakeToken = 'fake-auth-token';
      const fakeUserInfo = {
        id: '1',
        username: username,
        name: username,
        email: email,
      };

      // Store authentication data
      await AsyncStorage.setItem('userToken', fakeToken);
      await AsyncStorage.setItem('userInfo', JSON.stringify(fakeUserInfo));

      // Update state
      setUserToken(fakeToken);
      setUserInfo(fakeUserInfo);

      return true;
    } catch (registerError) {
      console.error('Signup error:', registerError);
      setError(registerError.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear stored authentication data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');

      // Update state
      setUserToken(null);
      setUserInfo(null);

      return true;
    } catch (logoutError) {
      console.error('Logout error:', logoutError);
      setError('Logout failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user info
  const updateUserInfo = async updatedInfo => {
    try {
      setIsLoading(true);
      setError(null);

      // Merge updated info with existing user info
      const newUserInfo = {...userInfo, ...updatedInfo};

      // Store updated user info
      await AsyncStorage.setItem('userInfo', JSON.stringify(newUserInfo));

      // Update state
      setUserInfo(newUserInfo);

      return true;
    } catch (updateError) {
      console.error('Update user info error:', updateError);
      setError('Failed to update user information.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        userToken,
        userInfo,
        error,
        login,
        register,
        logout,
        updateUserInfo,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
