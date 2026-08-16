import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export class SecureStorageHelper {
  static insecureFallbackAllowed(): boolean {
    return Platform.OS === "web" && __DEV__;
  }

  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("Failed to store secure item:", error);
      if (!this.insecureFallbackAllowed()) throw error;
      await AsyncStorage.setItem(`secure_${key}`, value);
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value) {
        await AsyncStorage.removeItem(`secure_${key}`).catch(() => undefined);
        return value;
      }
    } catch (error) {
      console.error("Failed to retrieve secure item:", error);
      if (!this.insecureFallbackAllowed()) return null;
    }

    const fallbackValue = await AsyncStorage.getItem(`secure_${key}`);
    if (!fallbackValue) return null;
    if (this.insecureFallbackAllowed()) return fallbackValue;

    try {
      await SecureStore.setItemAsync(key, fallbackValue);
      await AsyncStorage.removeItem(`secure_${key}`);
      return fallbackValue;
    } catch {
      await AsyncStorage.removeItem(`secure_${key}`).catch(() => undefined);
      return null;
    }
  }

  static async removeSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("Failed to remove secure item:", error);
    }

    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error("Failed to remove fallback item:", error);
    }
  }

  static async hasSecureItem(key: string): Promise<boolean> {
    const value = await this.getSecureItem(key);
    return value !== null;
  }

  static async wipeInsecureFallbacks(): Promise<void> {
    if (this.insecureFallbackAllowed()) return;
    try {
      const keys = await AsyncStorage.getAllKeys();
      const leftover = keys.filter(k => k.startsWith("secure_"));
      for (const storageKey of leftover) {
        const value = await AsyncStorage.getItem(storageKey);
        if (value) {
          await SecureStore.setItemAsync(storageKey.slice("secure_".length), value).catch(() => undefined);
        }
      }
      if (leftover.length > 0) await AsyncStorage.multiRemove(leftover);
    } catch (error) {
      console.error("Failed to wipe insecure token fallbacks:", error);
    }
  }
}
