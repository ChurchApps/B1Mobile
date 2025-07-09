import { QueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiHelper } from "../mobilehelper";

// Custom persistence utilities
const CACHE_KEY = "REACT_QUERY_CACHE";
const CACHE_VERSION = "1.0";

// Function to save cache to AsyncStorage
const persistCache = async (queryClient: QueryClient) => {
  try {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();

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

    // Check cache version and age (don't restore if older than 24 hours)
    const MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
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

    console.log(`Restored ${cacheData.queries.length} queries from cache`);
  } catch (error) {
    console.warn("Failed to restore React Query cache:", error);
    await AsyncStorage.removeItem(CACHE_KEY);
  }
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [path, apiListType] = queryKey;
        return ApiHelper.get(path as string, apiListType as string);
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: "offlineFirst", // Use cache first, then network
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      networkMode: "offlineFirst",
      retry: 2
    }
  }
});

// Auto-persist cache every 30 seconds
setInterval(() => {
  persistCache(queryClient);
}, 30000);

// Restore cache on initialization
export const initializeQueryCache = async () => {
  await restoreCache(queryClient);
};
