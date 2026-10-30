import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { showSignedOut, useAuthSession } from '../../auth/hooks/use-auth-session';
import { currentAccessToken } from '../api/current-access-token';
import { fetchProgress, isUnauthorized } from '../api/progress-client';

export const progressQueryKey = (userId: string) => ['progress', userId] as const;

export type ProgressStatus = 'loading' | 'ready' | 'error';

export interface ReadingProgress {
  readonly readPageIds: ReadonlySet<string>;
  readonly lastReadPageId: string | undefined;
  // Signed-out visitors get 'ready' with nothing read: the same pages, every item unmarked.
  readonly status: ProgressStatus;
  readonly signedIn: boolean;
  readonly retry: () => void;
}

const NOTHING_READ: ReadonlySet<string> = new Set();

export const useReadingProgress = (): ReadingProgress => {
  const queryClient = useQueryClient();
  const auth = useAuthSession();
  const userId = auth.status === 'signed-in' ? auth.user.id : '';

  const query = useQuery({
    queryKey: progressQueryKey(userId),
    queryFn: async ({ signal }) => {
      try {
        return await fetchProgress(await currentAccessToken(), signal);
      } catch (error) {
        if (isUnauthorized(error)) showSignedOut(queryClient);
        throw error;
      }
    },
    enabled: auth.status === 'signed-in',
  });

  const entries = query.data;
  const readPageIds = useMemo(() => new Set(entries?.map((entry) => entry.pageId)), [entries]);
  const lastReadPageId = useMemo(
    () =>
      entries && entries.length > 0
        ? [...entries].sort((a, b) => b.readAt.localeCompare(a.readAt))[0]?.pageId
        : undefined,
    [entries],
  );

  if (auth.status !== 'signed-in') {
    return {
      readPageIds: NOTHING_READ,
      lastReadPageId: undefined,
      status: auth.status === 'checking' ? 'loading' : 'ready',
      signedIn: false,
      retry: () => undefined,
    };
  }

  return {
    readPageIds,
    lastReadPageId,
    status: query.isError ? 'error' : query.isPending ? 'loading' : 'ready',
    signedIn: true,
    retry: () => {
      void query.refetch();
    },
  };
};
