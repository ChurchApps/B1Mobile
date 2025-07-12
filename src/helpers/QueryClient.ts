import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiHelper } from "../mobilehelper";

// Custom persistence utilities
const CACHE_KEY = "REACT_QUERY_CACHE";
const CACHE_VERSION = "1.0";

// Critical queries that should be persisted more frequently
const CRITICAL_QUERIES = ['/churches', '/user', '/appearance', '/settings/public'];

// Function to save cache to AsyncStorage
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

    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.warn("Failed to persist React Query cache:", error);
  }
};

// Function to restore cache from AsyncStorage
const restoreCache = async (queryClient: QueryClient) => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (!cached) return;

    const cacheData = JSON.parse(cached);

    // Check cache version and age (don't restore if older than 30 days)
    const MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
    if (cacheData.version !== CACHE_VERSION || Date.now() - cacheData.timestamp > MAX_CACHE_AGE) {
      await AsyncStorage.removeItem(CACHE_KEY);
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
    await AsyncStorage.removeItem(CACHE_KEY);
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
      // Stale-while-revalidate configuration
      staleTime: 0, // All data is immediately stale and will revalidate
      gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
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
      structuralSharing: true, // Prevent unnecessary re-renders
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

  // Clear persisted cache from AsyncStorage
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn("Failed to clear persisted cache:", error);
  }
};

// Smart invalidation based on API endpoints
const invalidateRelatedQueries = (endpoint: string) => {
  // Convert endpoint to lowercase for comparison
  const path = endpoint.toLowerCase();

  // Invalidate specific query patterns based on the API endpoint
  if (path.includes("/groups") || path.includes("/group")) {
    queryClient.invalidateQueries({ queryKey: ["/groups"] });
    queryClient.invalidateQueries({ queryKey: ["/events/group"] });
  }

  if (path.includes("/events") || path.includes("/event")) {
    queryClient.invalidateQueries({ queryKey: ["/events"] });
    queryClient.invalidateQueries({ queryKey: ["timeline"] });
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

// Restore cache on initialization
export const initializeQueryCache = async () => {
  await restoreCache(queryClient);
};
