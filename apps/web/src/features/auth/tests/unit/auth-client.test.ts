import { beforeEach, describe, expect, it, vi } from 'vitest';
import type * as AuthClientModule from '../../data/auth-client';

// The SDK client module is the network boundary here; the real auth-client maps its answers.
const sdk = vi.hoisted(() => ({
  client: undefined as
    | {
        getSession: ReturnType<typeof vi.fn>;
        signIn: { social: ReturnType<typeof vi.fn> };
        signOut: ReturnType<typeof vi.fn>;
        token: ReturnType<typeof vi.fn>;
      }
    | undefined,
}));

vi.mock('../../data/neon-auth-sdk', () => ({
  get neonAuthClient() {
    return sdk.client;
  },
}));

const JWT = 'eyJhbGciOiJFZERTQSJ9.eyJzdWIiOiJ1c2VyLTEifQ.c2lnbmF0dXJl';

const loadActual = () => vi.importActual<typeof AuthClientModule>('../../data/auth-client');

const sdkSession = (token: string) => ({
  data: {
    session: { id: 'session-1', token, expiresAt: '2026-11-01T00:00:00.000Z' },
    user: { id: 'user-1', name: 'Ana López', email: 'ana@example.com', image: null },
  },
  error: null,
});

beforeEach(() => {
  sdk.client = {
    getSession: vi.fn(() => Promise.resolve(sdkSession(JWT))),
    signIn: { social: vi.fn(() => Promise.resolve({ data: { redirect: true }, error: null })) },
    signOut: vi.fn(() => Promise.resolve({ data: { success: true }, error: null })),
    token: vi.fn(() => Promise.resolve({ data: { token: JWT }, error: null })),
  };
});

describe('auth client', () => {
  it('maps the SDK session to the user and the JWT access token', async () => {
    const { getAuthSession } = await loadActual();
    await expect(getAuthSession()).resolves.toEqual({
      user: { id: 'user-1', name: 'Ana López', email: 'ana@example.com' },
      accessToken: JWT,
    });
  });

  it('reports no session when the visitor is signed out', async () => {
    sdk.client?.getSession.mockResolvedValue({ data: null, error: null });
    const { getAuthSession } = await loadActual();
    await expect(getAuthSession()).resolves.toBeNull();
  });

  it('asks the token endpoint for the JWT when the session carries an opaque token', async () => {
    sdk.client?.getSession.mockResolvedValue(sdkSession('opaque-session-token'));
    const { getAuthSession } = await loadActual();
    await expect(getAuthSession()).resolves.toMatchObject({ accessToken: JWT });
    expect(sdk.client?.token).toHaveBeenCalledTimes(1);
  });

  it('treats a session without any JWT as signed out instead of sending an opaque token', async () => {
    sdk.client?.getSession.mockResolvedValue(sdkSession('opaque-session-token'));
    sdk.client?.token.mockResolvedValue({ data: null, error: { status: 404 } });
    const { getAuthSession } = await loadActual();
    await expect(getAuthSession()).resolves.toBeNull();
  });

  it('fails when the auth service answers with an error', async () => {
    sdk.client?.getSession.mockResolvedValue({
      data: null,
      error: { status: 503, message: 'Unavailable' },
    });
    const { getAuthSession } = await loadActual();
    await expect(getAuthSession()).rejects.toThrow();
  });

  it('starts the social sign-in with the provider and the callback URL', async () => {
    const { signInWithProvider } = await loadActual();
    await signInWithProvider('github', 'http://localhost:3000/lectura/amazon-sqs');
    expect(sdk.client?.signIn.social).toHaveBeenCalledWith({
      provider: 'github',
      callbackURL: 'http://localhost:3000/lectura/amazon-sqs',
    });
  });

  it('fails when the social sign-in is rejected', async () => {
    sdk.client?.signIn.social.mockResolvedValue({ data: null, error: { status: 400 } });
    const { signInWithProvider } = await loadActual();
    await expect(signInWithProvider('github', 'http://localhost:3000/')).rejects.toThrow();
  });

  it('signs out through the SDK', async () => {
    const { signOutUser } = await loadActual();
    await signOutUser();
    expect(sdk.client?.signOut).toHaveBeenCalledTimes(1);
  });

  it('fails clearly when VITE_NEON_AUTH_URL is not configured', async () => {
    sdk.client = undefined;
    const { getAuthSession, signInWithProvider } = await loadActual();
    await expect(getAuthSession()).rejects.toThrow('VITE_NEON_AUTH_URL');
    await expect(signInWithProvider('github', 'http://localhost:3000/')).rejects.toThrow(
      'VITE_NEON_AUTH_URL',
    );
  });
});
