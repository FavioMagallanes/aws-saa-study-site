import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { showSignedOut, useAuthSession } from '../../auth/hooks/use-auth-session';
import { currentAccessToken } from '../api/current-access-token';
import {
  ProgressRequestError,
  isUnauthorized,
  markPageRead,
  markPageUnread,
} from '../api/progress-client';
import { progressQueryKey } from './use-reading-progress';

interface SetPageReadVariables {
  readonly pageId: string;
  readonly read: boolean;
}

export const useSetPageRead = () => {
  const queryClient = useQueryClient();
  const auth = useAuthSession();
  const queryKey = progressQueryKey(auth.status === 'signed-in' ? auth.user.id : '');

  return useMutation<
    unknown,
    Error,
    SetPageReadVariables,
    { previous: ProgressEntry[] | undefined }
  >({
    mutationFn: async ({ pageId, read }) => {
      if (auth.status !== 'signed-in') {
        throw new ProgressRequestError('unauthorized', 'There is no session');
      }
      const accessToken = await currentAccessToken();
      return read ? markPageRead(pageId, accessToken) : markPageUnread(pageId, accessToken);
    },
    onMutate: async ({ pageId, read }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ProgressEntry[]>(queryKey);
      const others = (previous ?? []).filter((entry) => entry.pageId !== pageId);
      queryClient.setQueryData<ProgressEntry[]>(
        queryKey,
        read ? [...others, { pageId, readAt: new Date().toISOString() }] : others,
      );
      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
      if (isUnauthorized(error)) showSignedOut(queryClient);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
};
