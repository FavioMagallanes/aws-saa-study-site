import { getAuthSession } from '../../auth/data/auth-client';
import { ProgressRequestError } from './progress-client';

// Asked at request time, not read from the cached session, so the SDK can hand out a fresh JWT.
export const currentAccessToken = async (): Promise<string> => {
  const session = await getAuthSession().catch(() => null);
  if (!session) throw new ProgressRequestError('unauthorized', 'There is no session');
  return session.accessToken;
};
