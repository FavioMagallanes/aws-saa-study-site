import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchProgress } from '../api/progress-client';

export const PROGRESS_QUERY_KEY = ['progress'] as const;

export type ProgressStatus = 'loading' | 'ready' | 'error';

export interface ReadingProgress {
  readonly readPageIds: ReadonlySet<string>;
  readonly lastReadPageId: string | undefined;
  readonly status: ProgressStatus;
  readonly retry: () => void;
}

export const useReadingProgress = (): ReadingProgress => {
  const query = useQuery({
    queryKey: PROGRESS_QUERY_KEY,
    queryFn: ({ signal }) => fetchProgress(signal),
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

  return {
    readPageIds,
    lastReadPageId,
    status: query.isError ? 'error' : query.isPending ? 'loading' : 'ready',
    retry: () => {
      void query.refetch();
    },
  };
};
