import AsyncStorage from "@react-native-async-storage/async-storage";
import { SQLiteCacheHelper } from "./SQLiteCacheHelper";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

interface CacheStrategy {
  useSQL: boolean;
  maxAsyncStorageSize: number; // in KB
  sqliteThreshold: number; // size threshold for using SQLite in KB
}

export class HybridCachePersister implements Persister {
  private sqliteCache: SQLiteCacheHelper;
  private strategy: CacheStrategy;

  constructor(strategy: CacheStrategy = {
    useSQL: true,
    maxAsyncStorageSize: 2048, // 2MB limit for AsyncStorage
    sqliteThreshold: 50 // Use SQLite for entries > 50KB
  }) {
    this.sqliteCache = SQLiteCacheHelper.getInstance();
    this.strategy = strategy;
  }

  async persistClient(client: PersistedClient): Promise<void> {
    const serialized = JSON.stringify(client);
    const sizeKB = new Blob([serialized]).size / 1024;

    try {
      if (this.strategy.useSQL && sizeKB > this.strategy.sqliteThreshold) {
        // Large data goes to SQLite
        await this.sqliteCache.setItem("REACT_QUERY_CACHE", serialized, 30 * 24 * 60 * 60 * 1000); // 30 days

        // Remove from AsyncStorage if it exists there
        try {
          await AsyncStorage.removeItem("REACT_QUERY_CACHE");
        } catch (error) {
          // Ignore errors when removing from AsyncStorage
        }
      } else {
        // Small data goes to AsyncStorage
        await AsyncStorage.setItem("REACT_QUERY_CACHE", serialized);

        // Remove from SQLite if it exists there
        if (this.strategy.useSQL) {
          try {
            await this.sqliteCache.removeItem("REACT_QUERY_CACHE");
          } catch (error) {
            // Ignore errors when removing from SQLite
          }
        }
      }
    } catch (error) {
      console.error("Failed to persist query cache:", error);
      // Fallback to AsyncStorage if SQLite fails
      try {
        await AsyncStorage.setItem("REACT_QUERY_CACHE", serialized);
      } catch (fallbackError) {
        console.error("Fallback AsyncStorage persist also failed:", fallbackError);
        throw fallbackError;
      }
    }
  }

  async restoreClient(): Promise<PersistedClient | undefined> {
    try {
      // First try SQLite
      if (this.strategy.useSQL) {
        const sqliteData = await this.sqliteCache.getItem("REACT_QUERY_CACHE");
        if (sqliteData) {
          return JSON.parse(sqliteData);
        }
      }

      // Fallback to AsyncStorage
      const asyncStorageData = await AsyncStorage.getItem("REACT_QUERY_CACHE");
      if (asyncStorageData) {
        return JSON.parse(asyncStorageData);
      }

      return undefined;
    } catch (error) {
      console.error("Failed to restore query cache:", error);
      return undefined;
    }
  }

  async removeClient(): Promise<void> {
    try {
      // Remove from both storages
      await Promise.allSettled([
        AsyncStorage.removeItem("REACT_QUERY_CACHE"),
        this.strategy.useSQL ? this.sqliteCache.removeItem("REACT_QUERY_CACHE") : Promise.resolve()
      ]);
    } catch (error) {
      console.error("Failed to remove query cache:", error);
    }
  }

  // Utility methods for cache management
  async getCacheStats(): Promise<{
    asyncStorageSize: number;
    sqliteSize: number;
    sqliteEntryCount: number;
    location: "AsyncStorage" | "SQLite" | "None";
  }> {
    const stats = {
      asyncStorageSize: 0,
      sqliteSize: 0,
      sqliteEntryCount: 0,
      location: "None" as "AsyncStorage" | "SQLite" | "None"
    };

    try {
      // Check AsyncStorage
      const asyncData = await AsyncStorage.getItem("REACT_QUERY_CACHE");
      if (asyncData) {
        stats.asyncStorageSize = Math.round(new Blob([asyncData]).size / 1024);
        stats.location = "AsyncStorage";
      }

      // Check SQLite
      if (this.strategy.useSQL) {
        const sqliteData = await this.sqliteCache.getItem("REACT_QUERY_CACHE");
        if (sqliteData) {
          stats.sqliteSize = Math.round(new Blob([sqliteData]).size / 1024);
          stats.location = "SQLite";
        }

        const cacheSize = await this.sqliteCache.getCacheSize();
        stats.sqliteEntryCount = cacheSize.entryCount;
      }
    } catch (error) {
      console.error("Failed to get cache stats:", error);
    }

    return stats;
  }

  async cleanupCache(): Promise<void> {
    try {
      // Cleanup expired SQLite entries
      if (this.strategy.useSQL) {
        await this.sqliteCache.clearExpired();
        await this.sqliteCache.cleanupOldEntries();
      }
    } catch (error) {
      console.error("Failed to cleanup cache:", error);
    }
  }

  async migrateToSQLite(): Promise<void> {
    if (!this.strategy.useSQL) return;

    try {
      // Get data from AsyncStorage
      const asyncData = await AsyncStorage.getItem("REACT_QUERY_CACHE");
      if (asyncData) {
        // Move to SQLite
        await this.sqliteCache.setItem("REACT_QUERY_CACHE", asyncData, 30 * 24 * 60 * 60 * 1000);

        // Remove from AsyncStorage
        await AsyncStorage.removeItem("REACT_QUERY_CACHE");

        console.log("Successfully migrated React Query cache from AsyncStorage to SQLite");
      }
    } catch (error) {
      console.error("Failed to migrate cache to SQLite:", error);
    }
  }
}
