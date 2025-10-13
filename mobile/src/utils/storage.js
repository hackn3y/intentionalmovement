import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper with error handling
 */
export const storage = {
  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @returns {Promise<string|null>} Stored value or null
   */
  get: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store
   * @returns {Promise<boolean>} Success status
   */
  set: async (key, value) => {
    try {
      // If value is null or undefined, remove the item instead
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
        return true;
      }
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   * @returns {Promise<boolean>} Success status
   */
  remove: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  /**
   * Clear all items from storage
   * @returns {Promise<boolean>} Success status
   */
  clear: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Get multiple items from storage
   * @param {Array<string>} keys - Array of storage keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  multiGet: async (keys) => {
    try {
      const results = await AsyncStorage.multiGet(keys);
      const data = {};
      results.forEach(([key, value]) => {
        data[key] = value;
      });
      return data;
    } catch (error) {
      console.error('Error getting multiple items from storage:', error);
      return {};
    }
  },

  /**
   * Set multiple items in storage
   * @param {Array<Array<string>>} keyValuePairs - Array of [key, value] pairs
   * @returns {Promise<boolean>} Success status
   */
  multiSet: async (keyValuePairs) => {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error('Error setting multiple items in storage:', error);
      return false;
    }
  },

  /**
   * Get all keys from storage
   * @returns {Promise<Array<string>>} Array of keys
   */
  getAllKeys: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('Error getting all keys from storage:', error);
      return [];
    }
  },

  /**
   * Get object from storage (parses JSON)
   * @param {string} key - Storage key
   * @returns {Promise<Object|null>} Parsed object or null
   */
  getObject: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting object ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set object in storage (stringifies JSON)
   * @param {string} key - Storage key
   * @param {Object} value - Object to store
   * @returns {Promise<boolean>} Success status
   */
  setObject: async (key, value) => {
    try {
      // If value is null or undefined, remove the item instead
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
        return true;
      }
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting object ${key} in storage:`, error);
      return false;
    }
  },
};
