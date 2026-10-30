import { z } from 'zod';
import type { AuthProvider, AuthSession } from '../model/auth-session';

// The only module that talks to the Neon Auth SDK: tests replace this module and nothing above it.

const sdkSessionSchema = z.object({
  session: z.object({ token: z.string() }),
  user: z.object({ id: z.string().min(1), name: z.string(), email: z.string() }),
});

const sdkTokenSchema = z.object({ token: z.string() });

const JWT_SHAPE = /^[\w-]+\.[\w-]+\.[\w-]+$/;

const loadClient = async () => {
  const { neonAuthClient } = await import('./neon-auth-sdk');
  if (!neonAuthClient) throw new Error('VITE_NEON_AUTH_URL is not configured');
  return neonAuthClient;
};

type NeonAuthClient = Awaited<ReturnType<typeof loadClient>>;

// The SDK puts the JWT in session.token when the service sends it; otherwise ask for one.
const accessTokenFor = async (client: NeonAuthClient, sessionToken: string) => {
  if (JWT_SHAPE.test(sessionToken)) return sessionToken;
  const { data, error } = await client.token();
  if (error) return undefined;
  const parsed = sdkTokenSchema.safeParse(data);
  return parsed.success && JWT_SHAPE.test(parsed.data.token) ? parsed.data.token : undefined;
};

export const getAuthSession = async (): Promise<AuthSession | null> => {
  const client = await loadClient();
  const { data, error } = await client.getSession();
  if (error) throw new Error('The auth service could not return the session');
  if (!data) return null;
  const parsed = sdkSessionSchema.safeParse(data);
  if (!parsed.success) return null;
  const accessToken = await accessTokenFor(client, parsed.data.session.token);
  if (!accessToken) return null;
  const { id, name, email } = parsed.data.user;
  return { user: { id, name, email }, accessToken };
};

// Resolves only if the SDK does not leave the page; the browser normally navigates away.
export const signInWithProvider = async (
  provider: AuthProvider,
  callbackURL: string,
): Promise<void> => {
  const client = await loadClient();
  const { error } = await client.signIn.social({ provider, callbackURL });
  if (error) throw new Error('The auth service rejected the sign-in');
};

export const signOutUser = async (): Promise<void> => {
  const client = await loadClient();
  const { error } = await client.signOut();
  if (error) throw new Error('The auth service could not sign out');
};
