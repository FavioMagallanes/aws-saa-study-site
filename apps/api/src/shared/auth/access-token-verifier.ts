import { createRemoteJWKSet, errors, jwtVerify } from 'jose';

// The Neon Auth JWKS publishes Ed25519 keys only ("alg":"EdDSA"); any other algorithm is refused.
const ACCEPTED_ALGORITHMS = ['EdDSA'];

/** Resolves to the user id (`sub`) of a valid access token, or `null` when it must be refused. */
export type AccessTokenVerifier = (token: string) => Promise<string | null>;

// Problems reaching the key set are outages, not bad tokens, so they surface as server errors.
const isKeySetOutage = (error: unknown) => error instanceof errors.JWKSTimeout;

export const createAccessTokenVerifier = (jwksUrl: string): AccessTokenVerifier => {
  const keySet = createRemoteJWKSet(new URL(jwksUrl));
  return async (token) => {
    try {
      const { payload } = await jwtVerify(token, keySet, {
        algorithms: ACCEPTED_ALGORITHMS,
        requiredClaims: ['sub', 'exp'],
      });
      return payload.sub === undefined || payload.sub === '' ? null : payload.sub;
    } catch (error) {
      if (error instanceof errors.JOSEError && !isKeySetOutage(error)) return null;
      throw error;
    }
  };
};
