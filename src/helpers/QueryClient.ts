import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiHelper } from "@churchapps/helpers";
import { HybridCachePersister } from "./HybridCachePersister";

// Initialize hybrid cache persister for optimized storage
const hybridPersister = new HybridCachePersister({
  useSQL: true,
  maxAsyncStorageSize: 2048, // 2MB limit for AsyncStorage
  sqliteThreshold: 50 // Use SQLite for entries > 50KB
});

// Legacy constants - keeping for backward compatibility
const CACHE_KEY = "REACT_QUERY_CACHE";
const CACHE_VERSION = "1.0";
const LONG_TERM_CACHE_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days
const CRITICAL_QUERIES = ["/churches", "/user", "/appearance", "/settings/public"];

// Function to save cache using hybrid persister
const persistCache = async (queryClient: QueryClient, onlyCritical = false) => {
  try {
    const cache = queryClient.getQueryCache();
    let queries = cache.getAll();

    // If onlyCritical is true, only persist critical queries
    if (onlyCritical) {
      queries = queries.filter(query => {
        const queryKey = query.queryKey[0] as string;
        return CRITICAL_QUERIES.some(critical => queryKey.includes(critical));
      });
    }

    // Extract serializable data
    const serializedQueries = queries.map(query => ({
      queryKey: query.queryKey,
      state: {
        data: query.state.data,
        dataUpdateCount: query.state.dataUpdateCount,
        dataUpdatedAt: query.state.dataUpdatedAt,
        error: query.state.error,
        errorUpdateCount: query.state.errorUpdateCount,
        errorUpdatedAt: query.state.errorUpdatedAt,
        fetchFailureCount: query.state.fetchFailureCount,
        fetchFailureReason: query.state.fetchFailureReason,
        fetchMeta: query.state.fetchMeta,
        isInvalidated: query.state.isInvalidated,
        status: query.state.status,
        fetchStatus: query.state.fetchStatus
      }
    }));

    const cacheData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      queries: serializedQueries
    };

    // Use hybrid persister for intelligent storage selection
    await hybridPersister.persistClient(cacheData);
  } catch (error) {
    console.warn("Failed to persist React Query cache:", error);
  }
};

// Function to restore cache using hybrid persister
const restoreCache = async (queryClient: QueryClient) => {
  try {
    const cacheData = await hybridPersister.restoreClient();
    if (!cacheData) return;

    // Check cache version and age (don't restore if older than 30 days)
    if (cacheData.version !== CACHE_VERSION || Date.now() - cacheData.timestamp > LONG_TERM_CACHE_TIME) {
      await hybridPersister.removeClient();
      return;
    }

    // Restore queries
    const cache = queryClient.getQueryCache();
    cacheData.queries.forEach(({ queryKey, state }: any) => {
      try {
        cache
          .build(queryClient, {
            queryKey,
            queryFn: async ({ queryKey }) => {
              const [path, apiListType] = queryKey;
              return ApiHelper.get(path as string, apiListType as string);
            }
          })
          .setState(state);
      } catch (error) {
        console.warn("Failed to restore query:", queryKey, error);
      }
    });
  } catch (error) {
    console.warn("Failed to restore React Query cache:", error);
    await hybridPersister.removeClient();
  }
};

// Create the query client with stale-while-revalidate strategy
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [path, apiListType] = queryKey;
        return ApiHelper.get(path as string, apiListType as string);
      },
      // Stale-while-revalidate configuration with long-term cache retention
      staleTime: 0, // All data is immediately stale and will revalidate
      gcTime: LONG_TERM_CACHE_TIME, // Keep data in cache for 30 days for snappy app reopening
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "offlineFirst", // Use cache first, then network
      refetchOnWindowFocus: true, // Revalidate when window gets focus
      refetchOnReconnect: true, // Revalidate when network reconnects
      refetchOnMount: "always", // Always revalidate on component mount
      // Enable background refetching
      refetchInterval: false, // Don't use time-based polling
      refetchIntervalInBackground: false,
      // Ensure queries are considered stale immediately for better UX
      structuralSharing: true // Prevent unnecessary re-renders
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 2
    }
  }
});

// Auto-persist cache with optimized frequency
// Persist critical queries every 2 minutes, all queries every 5 minutes
let criticalPersistCounter = 0;

setInterval(() => {
  criticalPersistCounter++;

  if (criticalPersistCounter >= 5) {
    // Every 5 intervals (5 minutes) - persist all queries
    persistCache(queryClient, false);
    criticalPersistCounter = 0;
  } else {
    // Every interval (1 minute) - persist only critical queries
    persistCache(queryClient, true);
  }
}, 60000); // Run every 1 minute

// Function to invalidate all queries after POST requests
export const invalidateAllQueries = () => {
  queryClient.invalidateQueries();
};

// Function to completely clear all cached data (for logout/church switch)
export const clearAllCachedData = async () => {
  // Clear React Query cache
  queryClient.clear();

  // Clear persisted cache from both storage types
  try {
    await hybridPersister.removeClient();
    // Also clear legacy AsyncStorage entries
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear persisted cache:", error);
  }
};

// Smart invalidation based on API endpoints
const invalidateRelatedQueries = (endpoint: string) => {
  // Convert endpoint to lowercase for comparison
  const path = endpoint.toLowerCase();

  // Clear EventProcessor cache when events change
  if (path.includes("/events") || path.includes("/event")) {
    // Import and clear EventProcessor cache
    try {
      import("../components/group/EventProcessor").then(({ EventProcessor }) => {
        if (EventProcessor?.clearCache) {
          EventProcessor.clearCache();
        }
      }).catch(error => {
        console.warn("Could not clear EventProcessor cache:", error);
      });
    } catch (error) {
      console.warn("Error importing EventProcessor:", error);
    }
  }

  // Invalidate specific query patterns based on the API endpoint
  if (path.includes("/groups") || path.includes("/group")) {
    queryClient.invalidateQueries({ queryKey: ["/groups"] });
    queryClient.invalidateQueries({ queryKey: ["/events/group"] });
  }

  if (path.includes("/events") || path.includes("/event")) {
    queryClient.invalidateQueries({ queryKey: ["/events"] });
    queryClient.invalidateQueries({ queryKey: ["timeline"] });
    // Invalidate all group events queries
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0] as string;
        return key?.includes("/events/group/");
      }
    });
  }

  if (path.includes("/plans") || path.includes("/plan")) {
    queryClient.invalidateQueries({ queryKey: ["/plans"] });
    queryClient.invalidateQueries({ queryKey: ["/planItems"] });
    queryClient.invalidateQueries({ queryKey: ["/assignments"] });
  }

  if (path.includes("/donations") || path.includes("/subscriptions")) {
    queryClient.invalidateQueries({ queryKey: ["/funds"] });
    queryClient.invalidateQueries({ queryKey: ["/customers"] });
    queryClient.invalidateQueries({ queryKey: ["/subscriptions"] });
  }

  if (path.includes("/messages") || path.includes("/conversations")) {
    queryClient.invalidateQueries({ queryKey: ["/conversations"] });
    queryClient.invalidateQueries({ queryKey: ["/notifications"] });
    queryClient.invalidateQueries({ queryKey: ["timeline"] });
  }

  if (path.includes("/people") || path.includes("/person")) {
    queryClient.invalidateQueries({ queryKey: ["/people"] });
    queryClient.invalidateQueries({ queryKey: ["/groups"] });
  }

  // Always invalidate all for safety
  queryClient.invalidateQueries();
};

// Wrapper for ApiHelper.post that invalidates all queries
const originalPost = ApiHelper.post;
ApiHelper.post = async (...args: any[]) => {
  const result = await originalPost.apply(ApiHelper, args);
  // Use smart invalidation based on endpoint
  const endpoint = args[0] || "";
  invalidateRelatedQueries(endpoint);
  return result;
};

// Also wrap other mutation methods
const originalPut = ApiHelper.put;
ApiHelper.put = async (...args: any[]) => {
  const result = await originalPut.apply(ApiHelper, args);
  const endpoint = args[0] || "";
  invalidateRelatedQueries(endpoint);
  return result;
};

const originalDelete = ApiHelper.delete;
ApiHelper.delete = async (...args: any[]) => {
  const result = await originalDelete.apply(ApiHelper, args);
  const endpoint = args[0] || "";
  invalidateRelatedQueries(endpoint);
  return result;
};

// Restore cache on initialization with migration support
export const initializeQueryCache = async () => {
  await restoreCache(queryClient);

  // Migrate existing AsyncStorage cache to SQLite if needed
  try {
    await hybridPersister.migrateToSQLite();
  } catch (error) {
    console.warn("Cache migration failed:", error);
  }
};

// Export cache management utilities
export const getCacheStats = () => hybridPersister.getCacheStats();
export const cleanupCache = () => hybridPersister.cleanupCache();
