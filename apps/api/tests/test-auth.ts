import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey, type JWK } from 'jose';

// Neon Auth signs with Ed25519 (alg EdDSA); the test issuer does the same with a key made here.
const NEON_ALG = 'EdDSA';
const SIGNING_KID = 'test-signing-key';
const OTHER_ALG_KID = 'test-es256-key';

interface TokenOptions {
  readonly sub?: string;
  readonly expiresAt?: number;
  readonly key?: 'served' | 'unknown' | 'es256';
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

const publicJwk = async (key: CryptoKey, kid: string, alg: string): Promise<JWK> => ({
  ...(await exportJWK(key)),
  kid,
  alg,
});

/**
 * A local stand-in for the Neon Auth JWKS endpoint. The API is configured with its URL exactly as
 * in production, so every token goes through the real remote key set and verification code.
 */
export const startTestIssuer = async () => {
  const served = await generateKeyPair(NEON_ALG, { crv: 'Ed25519', extractable: true });
  // Same kid as the served key but a different private key: a forged signature.
  const unknown = await generateKeyPair(NEON_ALG, { crv: 'Ed25519', extractable: true });
  // Published in the key set but with an algorithm Neon Auth does not use.
  const es256 = await generateKeyPair('ES256', { extractable: true });
  const keys = [
    await publicJwk(served.publicKey, SIGNING_KID, NEON_ALG),
    await publicJwk(es256.publicKey, OTHER_ALG_KID, 'ES256'),
  ];

  const server: Server = createServer((req, res) => {
    if (req.url !== '/.well-known/jwks.json') {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ keys }));
  }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address() as AddressInfo;

  const sign = ({ sub, expiresAt = nowSeconds() + 900, key = 'served' }: TokenOptions = {}) => {
    const [privateKey, alg, kid] =
      key === 'es256'
        ? [es256.privateKey, 'ES256', OTHER_ALG_KID]
        : [key === 'served' ? served.privateKey : unknown.privateKey, NEON_ALG, SIGNING_KID];
    const jwt = new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg, kid })
      .setIssuedAt(Math.min(nowSeconds(), expiresAt - 60))
      .setExpirationTime(expiresAt);
    return (sub === undefined ? jwt : jwt.setSubject(sub)).sign(privateKey);
  };

  return {
    jwksUrl: `http://127.0.0.1:${String(port)}/.well-known/jwks.json`,
    sign,
    expiredSeconds: () => nowSeconds() - 1,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
};

export type TestIssuer = Awaited<ReturnType<typeof startTestIssuer>>;
