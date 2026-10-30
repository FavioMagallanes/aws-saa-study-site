import { useQuery, type QueryClient } from '@tanstack/react-query';
import { getAuthSession } from '../data/auth-client';
import type { AuthState } from '../model/auth-session';

export const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;

// Read once per page load: the SDK keeps the token fresh, sign-in reloads the page and sign-out
// or a rejected token update this entry directly, so refetching on a timer could only loop.
export const useAuthSession = (): AuthState => {
  const query = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: getAuthSession,
    staleTime: Infinity,
    retry: false,
  });

  if (query.isPending) return { status: 'checking' };
  // An unreachable auth service leaves the site readable, as a signed-out visitor.
  if (query.isError || !query.data) return { status: 'signed-out' };
  return { status: 'signed-in', user: query.data.user };
};

// Called when the progress API rejects the token: show the signed-out state without retrying.
export const showSignedOut = (queryClient: QueryClient): void => {
  queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, null);
};
