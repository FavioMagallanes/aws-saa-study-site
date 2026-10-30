import type { RequestHandler, Response } from 'express';
import type { AccessTokenVerifier } from './access-token-verifier.ts';

const BEARER_TOKEN = /^Bearer ([^\s]+)$/i;

export const requireUser =
  (verifyAccessToken: AccessTokenVerifier): RequestHandler =>
  async (req, res, next) => {
    const token = BEARER_TOKEN.exec(req.header('authorization') ?? '')?.[1];
    const userId = token === undefined ? null : await verifyAccessToken(token);
    if (userId === null) {
      res.status(401).json({ error: 'unauthorized' });
      return;
    }
    res.locals.userId = userId;
    next();
  };

/** The caller's user id; only valid in handlers that run after `requireUser`. */
export const authenticatedUserId = (res: Response): string => {
  const userId: unknown = res.locals.userId;
  if (typeof userId !== 'string') throw new Error('requireUser must run before this handler');
  return userId;
};
