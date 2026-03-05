import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't re-fetch when the window regains focus — saves unnecessary Firestore reads
      refetchOnWindowFocus: false,
      // Retry once before surfacing an error to the UI
      retry: 1,
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep unused cache entries for 10 minutes before GC
      gcTime: 10 * 60 * 1000,
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
    },
    mutations: {
      // Don't retry failed mutations by default (prevents duplicate writes)
      retry: 0,
    },
  },
});
