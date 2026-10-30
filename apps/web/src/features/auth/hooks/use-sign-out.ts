import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signOutUser } from '../data/auth-client';
import { showSignedOut } from './use-auth-session';

export const useSignOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOutUser,
    onSuccess: () => {
      showSignedOut(queryClient);
    },
  });
};
