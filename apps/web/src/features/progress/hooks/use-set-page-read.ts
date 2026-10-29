import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { markPageRead, markPageUnread, ProgressRequestError } from '../api/progress-client';
import { useWriteKeyStore } from '../store/use-write-key-store';
import { PROGRESS_QUERY_KEY } from './use-reading-progress';

interface SetPageReadVariables {
  readonly pageId: string;
  readonly read: boolean;
}

export const useSetPageRead = () => {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    SetPageReadVariables,
    { previous: ProgressEntry[] | undefined }
  >({
    mutationFn: async ({ pageId, read }) => {
      const writeKey = useWriteKeyStore.getState().writeKey;
      if (!writeKey) throw new ProgressRequestError('missing-key', 'No write key is stored');
      return read ? markPageRead(pageId, writeKey) : markPageUnread(pageId, writeKey);
    },
    onMutate: async ({ pageId, read }) => {
      await queryClient.cancelQueries({ queryKey: PROGRESS_QUERY_KEY });
      const previous = queryClient.getQueryData<ProgressEntry[]>(PROGRESS_QUERY_KEY);
      const others = (previous ?? []).filter((entry) => entry.pageId !== pageId);
      queryClient.setQueryData<ProgressEntry[]>(
        PROGRESS_QUERY_KEY,
        read ? [...others, { pageId, readAt: new Date().toISOString() }] : others,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context) queryClient.setQueryData(PROGRESS_QUERY_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: PROGRESS_QUERY_KEY }),
  });
};
