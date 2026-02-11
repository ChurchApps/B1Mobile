import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ApiHelper } from "@/helpers";

// Cache strategy: Immediate stale + 30-day retention
// - Data is immediately considered stale (staleTime: 0)
// - Fresh data fetches in background on every access
// - But cached data persists for 30 days for snappy app reopening
// - Users see old data instantly, then get fresh data seamlessly
const LONG_TERM_CACHE_TIME = 30 * 24 * 60 * 60 * 1000; // 30 days

interface StaleWhileRevalidateOptions<T> extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  queryKey: any[];
  apiEndpoint: string;
  apiType?: string;
  // Custom stale time for specific queries (overrides global staleTime: 0)
  customStaleTime?: number;
  // Whether to show skeleton loading on initial load
  useSkeletonOnInitial?: boolean;
}

export function useStaleWhileRevalidate<T = any>({
  queryKey,
  apiEndpoint,
  apiType = "MembershipApi",
  customStaleTime,
  useSkeletonOnInitial = true,
  ...options
}: StaleWhileRevalidateOptions<T>) {

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const [path] = queryKey;
      return ApiHelper.get(apiEndpoint || path as string, apiType);
    },
    // Override staleTime if provided
    staleTime: customStaleTime !== undefined ? customStaleTime : 0,
    // Ensure we always refetch but show stale data immediately
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Keep cached data for 30 days for snappy app reopening
    gcTime: LONG_TERM_CACHE_TIME,
    ...options
  });

  return {
    ...query,
    // Helper to determine if we should show skeleton
    showSkeleton: useSkeletonOnInitial && query.isLoading && !query.data,
    // Helper to check if data is being refreshed in background
    isRevalidating: query.isFetching && !query.isLoading,
    // Helper to check if we have stale data
    hasStaleData: !!query.data && query.isStale
  };
}

// Specialized hooks for common use cases

// Specialized hooks with immediate staleness but long-term caching
// All data is considered immediately stale but cached for 30 days

export function useChurchData(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ["church", churchId],
    apiEndpoint: `/churches/${churchId}`
    // No custom stale time - use immediate staleness
  });
}

export function useChurchAppearance(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ["appearance", churchId],
    apiEndpoint: `/settings/public/${churchId}`
    // No custom stale time - use immediate staleness
  });
}

export function useUserData() {
  return useStaleWhileRevalidate({
    queryKey: ["user"],
    apiEndpoint: "/users/current"
    // No custom stale time - use immediate staleness
  });
}

export function useGroups() {
  return useStaleWhileRevalidate({
    queryKey: ["groups"],
    apiEndpoint: "/groups"
    // No custom stale time - use immediate staleness
  });
}

export function usePlans() {
  return useStaleWhileRevalidate({
    queryKey: ["plans"],
    apiEndpoint: "/plans",
    apiType: "DoingApi"
    // No custom stale time - use immediate staleness
  });
}

export function useSermons(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ["sermons", churchId],
    apiEndpoint: `/playlists/public/${churchId}`,
    apiType: "ContentApi"
    // No custom stale time - use immediate staleness
  });
}

export function useDonationFunds(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ["funds", churchId],
    apiEndpoint: `/funds/churchId/${churchId}`,
    apiType: "GivingApi"
    // No custom stale time - use immediate staleness
  });
}
