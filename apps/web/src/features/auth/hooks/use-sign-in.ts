import { useMutation } from '@tanstack/react-query';
import { signInWithProvider } from '../data/auth-client';
import type { AuthProvider } from '../model/auth-session';
import { safeReturnTo } from '../model/return-to';

interface SignInVariables {
  readonly provider: AuthProvider;
  readonly returnTo: string;
}

// The callback must be absolute (Neon Auth redirects to it from its own origin) and is checked
// again here, next to where it is used, so only a same-origin path can ever become the target.
const callbackUrlFor = (returnTo: string): string =>
  new URL(safeReturnTo(returnTo) ?? '/', window.location.origin).toString();

export const useSignIn = () =>
  useMutation({
    mutationFn: ({ provider, returnTo }: SignInVariables) =>
      signInWithProvider(provider, callbackUrlFor(returnTo)),
  });
