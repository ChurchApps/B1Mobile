import * as SQLite from "expo-sqlite";

interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
  expiry?: number;
}

export class SQLiteCacheHelper {
  private static instance: SQLiteCacheHelper;
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): SQLiteCacheHelper {
    if (!SQLiteCacheHelper.instance) {
      SQLiteCacheHelper.instance = new SQLiteCacheHelper();
    }
    return SQLiteCacheHelper.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync("cache.db");

      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS cache_entries (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          expiry INTEGER
        );
        
        CREATE INDEX IF NOT EXISTS idx_timestamp ON cache_entries(timestamp);
        CREATE INDEX IF NOT EXISTS idx_expiry ON cache_entries(expiry);
      `);

      this.initialized = true;
      console.log("SQLite cache database initialized");
    } catch (error) {
      console.error("Failed to initialize SQLite cache:", error);
      throw error;
    }
  }

  async setItem(key: string, value: string, expiryMs?: number): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    const timestamp = Date.now();
    const expiry = expiryMs ? timestamp + expiryMs : null;

    try {
      await this.db.runAsync(
        "INSERT OR REPLACE INTO cache_entries (key, value, timestamp, expiry) VALUES (?, ?, ?, ?)",
        [key, value, timestamp, expiry]
      );
    } catch (error) {
      console.error("Failed to set cache item:", error);
      throw error;
    }
  }

  async getItem(key: string): Promise<string | null> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<CacheEntry>(
        "SELECT * FROM cache_entries WHERE key = ?",
        [key]
      );

      if (!result) return null;

      // Check if item has expired
      if (result.expiry && Date.now() > result.expiry) {
        await this.removeItem(key);
        return null;
      }

      return result.value;
    } catch (error) {
      console.error("Failed to get cache item:", error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync("DELETE FROM cache_entries WHERE key = ?", [key]);
    } catch (error) {
      console.error("Failed to remove cache item:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      await this.db.runAsync("DELETE FROM cache_entries");
    } catch (error) {
      console.error("Failed to clear cache:", error);
      throw error;
    }
  }

  async clearExpired(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      const now = Date.now();
      await this.db.runAsync("DELETE FROM cache_entries WHERE expiry IS NOT NULL AND expiry < ?", [now]);
    } catch (error) {
      console.error("Failed to clear expired cache items:", error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      const results = await this.db.getAllAsync<{ key: string }>("SELECT key FROM cache_entries");
      return results.map(row => row.key);
    } catch (error) {
      console.error("Failed to get all cache keys:", error);
      return [];
    }
  }

  async getCacheSize(): Promise<{ entryCount: number; estimatedSizeKB: number }> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      const countResult = await this.db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM cache_entries");
      const sizeResult = await this.db.getFirstAsync<{ total_size: number }>("SELECT SUM(LENGTH(value)) as total_size FROM cache_entries");

      return {
        entryCount: countResult?.count || 0,
        estimatedSizeKB: Math.round((sizeResult?.total_size || 0) / 1024)
      };
    } catch (error) {
      console.error("Failed to get cache size:", error);
      return { entryCount: 0, estimatedSizeKB: 0 };
    }
  }

  async cleanupOldEntries(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error("Database not initialized");

    try {
      const cutoffTime = Date.now() - maxAgeMs;
      await this.db.runAsync("DELETE FROM cache_entries WHERE timestamp < ?", [cutoffTime]);
    } catch (error) {
      console.error("Failed to cleanup old cache entries:", error);
      throw error;
    }
  }
}
