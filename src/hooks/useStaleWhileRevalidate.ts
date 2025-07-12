import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ApiHelper } from '@/helpers';

interface StaleWhileRevalidateOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
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
  apiType = 'MembershipApi',
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
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // Keep cached data longer since we're always revalidating
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });

  return {
    ...query,
    // Helper to determine if we should show skeleton
    showSkeleton: useSkeletonOnInitial && query.isLoading && !query.data,
    // Helper to check if data is being refreshed in background
    isRevalidating: query.isFetching && !query.isLoading,
    // Helper to check if we have stale data
    hasStaleData: !!query.data && query.isStale,
  };
}

// Specialized hooks for common use cases

export function useChurchData(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ['church', churchId],
    apiEndpoint: `/churches/${churchId}`,
    customStaleTime: 10 * 60 * 1000, // Church data can be stale for 10 minutes
  });
}

export function useChurchAppearance(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ['appearance', churchId],
    apiEndpoint: `/settings/public/${churchId}`,
    customStaleTime: 15 * 60 * 1000, // Appearance changes less frequently
  });
}

export function useUserData() {
  return useStaleWhileRevalidate({
    queryKey: ['user'],
    apiEndpoint: '/users/current',
    customStaleTime: 5 * 60 * 1000, // User data should be fresh
  });
}

export function useGroups() {
  return useStaleWhileRevalidate({
    queryKey: ['groups'],
    apiEndpoint: '/groups',
    customStaleTime: 0, // Always fresh groups data
  });
}

export function usePlans() {
  return useStaleWhileRevalidate({
    queryKey: ['plans'],
    apiEndpoint: '/plans',
    apiType: 'DoingApi',
    customStaleTime: 2 * 60 * 1000, // Plans should be relatively fresh
  });
}

export function useSermons(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ['sermons', churchId],
    apiEndpoint: `/playlists/public/${churchId}`,
    apiType: 'ContentApi',
    customStaleTime: 5 * 60 * 1000, // Sermons can be stale for 5 minutes
  });
}

export function useDonationFunds(churchId: string) {
  return useStaleWhileRevalidate({
    queryKey: ['funds', churchId],
    apiEndpoint: `/funds/churchId/${churchId}`,
    apiType: 'GivingApi',
    customStaleTime: 15 * 60 * 1000, // Funds don't change often
  });
}