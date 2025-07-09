import { QueryClient } from "@tanstack/react-query";
import { ApiHelper } from "../mobilehelper";

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
