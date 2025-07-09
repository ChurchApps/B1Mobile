import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Helper class for secure storage of sensitive data like JWT tokens
 * Uses Expo SecureStore for encrypted storage with AsyncStorage fallback
 */
export class SecureStorageHelper {
  /**
   * Securely store a value with encryption
   */
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Failed to store secure item:", error);
      // Fallback to AsyncStorage for development/web
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  }

  /**
   * Retrieve a securely stored value
   */
  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) return value;

      // Check for migrated data from AsyncStorage
      const fallbackValue = await AsyncStorage.getItem(`secure_${key}`);
      if (fallbackValue) {
        // Migrate to secure storage and clean up
        await this.setSecureItem(key, fallbackValue);
        await AsyncStorage.removeItem(`secure_${key}`);
        return fallbackValue;
      }

      return null;
    } catch (error) {
      console.error("Failed to retrieve secure item:", error);
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(`secure_${key}`);
    }
  }

  /**
   * Remove a securely stored value
   */
  static async removeSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Failed to remove secure item:", error);
    }

    // Also clean up any fallback storage
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error("Failed to remove fallback item:", error);
    }
  }

  /**
   * Check if a secure item exists
   */
  static async hasSecureItem(key: string): Promise<boolean> {
    const value = await this.getSecureItem(key);
    return value !== null;
  }

  /**
   * Migrate existing JWT tokens from AsyncStorage to SecureStore
   */
  static async migrateTokensFromAsyncStorage(): Promise<void> {
    try {
      // Check for existing user data with JWT tokens
      const userData = await AsyncStorage.getItem("USER_DATA");
      if (userData) {
        // If user data exists, check if we have JWT tokens to migrate
        // This will be handled by the specific token migration in UserHelper
      }
    } catch (error) {
      console.error("Failed to migrate tokens:", error);
    }
  }
}
