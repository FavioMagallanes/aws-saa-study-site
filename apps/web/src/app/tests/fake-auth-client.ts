import type * as AuthClientModule from '../../features/auth/data/auth-client';
import type { AuthProvider, AuthSession } from '../../features/auth/model/auth-session';

// Replaces only the network boundary of the Neon Auth SDK (features/auth/data/auth-client.ts);
// every hook, screen and the progress client above it run for real.

export const TEST_ACCESS_TOKEN = 'header.payload.signature';

export const TEST_SESSION: AuthSession = {
  user: { id: 'user-1', name: 'Ana López', email: 'ana@example.com' },
  accessToken: TEST_ACCESS_TOKEN,
};

interface SignInCall {
  readonly provider: AuthProvider;
  readonly callbackURL: string;
}

interface FakeAuthState {
  session: AuthSession | null;
  sessionFails: boolean;
  signInFails: boolean;
  sessionRequests: number;
  signOutCalls: number;
  readonly signInCalls: SignInCall[];
}

const initialState = (): FakeAuthState => ({
  session: TEST_SESSION,
  sessionFails: false,
  signInFails: false,
  sessionRequests: 0,
  signOutCalls: 0,
  signInCalls: [],
});

export const fakeAuth: FakeAuthState = initialState();

export const resetFakeAuth = (): void => {
  Object.assign(fakeAuth, initialState());
};

export const fakeAuthClient: typeof AuthClientModule = {
  getAuthSession: () => {
    fakeAuth.sessionRequests += 1;
    if (fakeAuth.sessionFails) return Promise.reject(new Error('Auth service unreachable'));
    return Promise.resolve(fakeAuth.session);
  },
  signInWithProvider: (provider, callbackURL) => {
    fakeAuth.signInCalls.push({ provider, callbackURL });
    if (fakeAuth.signInFails) return Promise.reject(new Error('Auth service unreachable'));
    // The real SDK leaves the page here; the promise never settles before the browser navigates.
    return new Promise<void>(() => undefined);
  },
  signOutUser: () => {
    fakeAuth.signOutCalls += 1;
    fakeAuth.session = null;
    return Promise.resolve();
  },
};
