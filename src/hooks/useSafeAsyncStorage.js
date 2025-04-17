import {useState, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook to safely interact with AsyncStorage
 * Provides methods for getting, setting, and removing items with proper error handling
 */
const useSafeAsyncStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Safely get data from AsyncStorage
   * @param {string} key - The key to retrieve from storage
   * @param {any} defaultValue - Default value to return if key not found
   * @returns {Promise<any>} - The stored value or defaultValue
   */
  const getItem = useCallback(async (key, defaultValue = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue);
      }
      return defaultValue;
    } catch (err) {
      console.error(`Error getting item [${key}] from AsyncStorage:`, err);
      setError(err.message || 'Failed to retrieve data from storage');
      return defaultValue;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Safely store data in AsyncStorage
   * @param {string} key - The key to store under
   * @param {any} value - The value to store
   * @returns {Promise<boolean>} - Success status
   */
  const setItem = useCallback(async (key, value) => {
    setIsLoading(true);
    setError(null);

    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (err) {
      console.error(`Error setting item [${key}] in AsyncStorage:`, err);
      setError(err.message || 'Failed to save data to storage');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Safely remove data from AsyncStorage
   * @param {string} key - The key to remove from storage
   * @returns {Promise<boolean>} - Success status
   */
  const removeItem = useCallback(async key => {
    setIsLoading(true);
    setError(null);

    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error(`Error removing item [${key}] from AsyncStorage:`, err);
      setError(err.message || 'Failed to remove data from storage');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if a key exists in AsyncStorage
   * @param {string} key - The key to check
   * @returns {Promise<boolean>} - Whether the key exists
   */
  const hasItem = useCallback(async key => {
    setIsLoading(true);
    setError(null);

    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (err) {
      console.error(`Error checking item [${key}] in AsyncStorage:`, err);
      setError(err.message || 'Failed to check data in storage');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get data from storage with time-to-live validation
   * @param {string} key - The key to retrieve
   * @param {number} ttl - Time to live in milliseconds
   * @param {any} defaultValue - Default value to return if key not found or expired
   * @returns {Promise<any>} - The stored value if valid, or defaultValue
   */
  const getItemWithTTL = useCallback(
    async (key, ttl, defaultValue = null) => {
      try {
        const storedData = await getItem(key);

        if (storedData && storedData.timestamp) {
          const now = Date.now();
          if (now - storedData.timestamp < ttl) {
            return storedData.data;
          }
          // Data expired, remove it
          await removeItem(key);
        }
        return defaultValue;
      } catch (err) {
        console.error(`Error getting item with TTL [${key}]:`, err);
        return defaultValue;
      }
    },
    [getItem, removeItem],
  );

  /**
   * Store data with timestamp for TTL validation
   * @param {string} key - The key to store under
   * @param {any} data - The data to store
   * @returns {Promise<boolean>} - Success status
   */
  const setItemWithTTL = useCallback(
    async (key, data) => {
      try {
        const timestampedData = {
          timestamp: Date.now(),
          data,
        };
        return await setItem(key, timestampedData);
      } catch (err) {
        console.error(`Error setting item with TTL [${key}]:`, err);
        return false;
      }
    },
    [setItem],
  );

  return {
    getItem,
    setItem,
    removeItem,
    hasItem,
    getItemWithTTL,
    setItemWithTTL,
    isLoading,
    error,
  };
};

export default useSafeAsyncStorage;
