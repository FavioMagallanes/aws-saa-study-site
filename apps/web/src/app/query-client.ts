import { QueryClient } from '@tanstack/react-query';
import { isUnauthorized } from '../features/progress/api/progress-client';

const MAX_RETRIES = 3;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // A rejected token turns into the signed-out state; asking again would only loop.
      retry: (failureCount, error) => !isUnauthorized(error) && failureCount < MAX_RETRIES,
    },
  },
});
