import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { progressEntrySchema, progressResponseSchema } from '@arquitecto/contracts/progress';
import { createApp } from '../src/app/app.ts';
import { readPages } from '../src/features/progress/data/progress.schema.ts';
import { createDatabase } from '../src/shared/db/client.ts';
import { startTestIssuer, type TestIssuer } from './test-auth.ts';
import { TEST_DATABASE_URL } from './test-database.ts';

const ALICE = 'dc42fa70-09a7-4038-a3bb-f61dda854910';
const BOB = '5b1c1f0e-7a52-4c1e-9f8e-0f4a2d6b9c11';
const UNAUTHORIZED = { error: 'unauthorized' };

const database = createDatabase(TEST_DATABASE_URL);
let issuer: TestIssuer;
let server: Server;
let baseUrl: string;

const request = (path: string, method = 'GET', authorization?: string) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: authorization === undefined ? {} : { authorization },
  });

const bearer = async (sub: string) => `Bearer ${await issuer.sign({ sub })}`;

const listProgress = async (sub: string) => {
  const response = await request('/api/progress', 'GET', await bearer(sub));
  expect(response.status).toBe(200);
  return progressResponseSchema.parse(await response.json()).entries;
};

const markRead = async (sub: string, pageId: string) => {
  const response = await request(`/api/progress/${pageId}`, 'PUT', await bearer(sub));
  expect(response.status).toBe(200);
  return progressEntrySchema.parse(await response.json());
};

beforeAll(async () => {
  issuer = await startTestIssuer();
  server = createApp({ db: database.db, neonAuthJwksUrl: issuer.jwksUrl }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

beforeEach(async () => {
  await database.db.delete(readPages);
});

afterAll(async () => {
  server.close();
  await issuer.close();
  await database.close();
});

describe('authentication on every progress route', () => {
  const rejected: readonly (readonly [string, () => Promise<string | undefined>])[] = [
    ['no Authorization header', () => Promise.resolve(undefined)],
    ['an empty bearer token', () => Promise.resolve('Bearer ')],
    ['a token that is not a JWT', () => Promise.resolve('Bearer not-a-jwt')],
    ['a token without the Bearer scheme', async () => issuer.sign({ sub: ALICE })],
    ['the Basic scheme', () => Promise.resolve('Basic YWxpY2U6c2VjcmV0')],
    [
      'a token signed by a key outside the JWKS',
      async () => `Bearer ${await issuer.sign({ sub: ALICE, key: 'unknown' })}`,
    ],
    [
      'an algorithm the JWKS does not use for Neon Auth',
      async () => `Bearer ${await issuer.sign({ sub: ALICE, key: 'es256' })}`,
    ],
    [
      'an expired token',
      async () => `Bearer ${await issuer.sign({ sub: ALICE, expiresAt: issuer.expiredSeconds() })}`,
    ],
    ['a token without sub', async () => `Bearer ${await issuer.sign()}`],
  ];

  describe.each(rejected)('with %s', (_label, authorization) => {
    beforeEach(async () => {
      await markRead(ALICE, 'amazon-s3');
    });

    it('GET answers 401 unauthorized', async () => {
      const response = await request('/api/progress', 'GET', await authorization());
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(UNAUTHORIZED);
    });

    it('PUT answers 401 and stores nothing', async () => {
      const before = await listProgress(ALICE);
      const response = await request('/api/progress/amazon-sqs', 'PUT', await authorization());
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(UNAUTHORIZED);
      expect(await listProgress(ALICE)).toEqual(before);
    });

    it('DELETE answers 401 and keeps the entry', async () => {
      const before = await listProgress(ALICE);
      const response = await request('/api/progress/amazon-s3', 'DELETE', await authorization());
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual(UNAUTHORIZED);
      expect(await listProgress(ALICE)).toEqual(before);
    });
  });

  it('checks the token before the page id', async () => {
    const response = await request('/api/progress/Not_Valid', 'PUT');
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(UNAUTHORIZED);
  });
});

describe('GET /api/progress', () => {
  it('returns an empty list when the caller read nothing', async () => {
    const response = await request('/api/progress', 'GET', await bearer(ALICE));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entries: [] });
  });

  it('returns only the caller entries', async () => {
    const aliceEntry = await markRead(ALICE, 'amazon-s3');
    const bobEntry = await markRead(BOB, 'amazon-sqs');
    expect(await listProgress(ALICE)).toEqual([aliceEntry]);
    expect(await listProgress(BOB)).toEqual([bobEntry]);
  });
});

describe('PUT /api/progress/:pageId', () => {
  it('marks a page as read for the caller and lists it', async () => {
    const response = await request('/api/progress/amazon-sqs', 'PUT', await bearer(ALICE));
    expect(response.status).toBe(200);
    const entry = progressEntrySchema.parse(await response.json());
    expect(entry.pageId).toBe('amazon-sqs');
    expect(await listProgress(ALICE)).toEqual([entry]);
  });

  it('is idempotent: marking twice keeps one entry with the original date', async () => {
    const first = await markRead(ALICE, 'amazon-sqs');
    const second = await markRead(ALICE, 'amazon-sqs');
    expect(second).toEqual(first);
    expect(await listProgress(ALICE)).toEqual([first]);
  });

  it('keeps a separate entry per user for the same page', async () => {
    const aliceEntry = await markRead(ALICE, 'amazon-sqs');
    const bobEntry = await markRead(BOB, 'amazon-sqs');
    expect(await listProgress(ALICE)).toEqual([aliceEntry]);
    expect(await listProgress(BOB)).toEqual([bobEntry]);
  });

  it('rejects an invalid page id with 400 and stores nothing', async () => {
    const response = await request('/api/progress/Not_Valid', 'PUT', await bearer(ALICE));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_page_id' });
    expect(await listProgress(ALICE)).toEqual([]);
  });
});

describe('DELETE /api/progress/:pageId', () => {
  it('marks a page as unread for the caller', async () => {
    await markRead(ALICE, 'amazon-sqs');
    const response = await request('/api/progress/amazon-sqs', 'DELETE', await bearer(ALICE));
    expect(response.status).toBe(204);
    expect(await listProgress(ALICE)).toEqual([]);
  });

  it('does not delete another user entry for the same page', async () => {
    const aliceEntry = await markRead(ALICE, 'amazon-sqs');
    const response = await request('/api/progress/amazon-sqs', 'DELETE', await bearer(BOB));
    expect(response.status).toBe(204);
    expect(await listProgress(ALICE)).toEqual([aliceEntry]);
  });

  it('succeeds when the page was never read', async () => {
    const response = await request('/api/progress/amazon-sqs', 'DELETE', await bearer(ALICE));
    expect(response.status).toBe(204);
  });

  it('rejects an invalid page id with 400', async () => {
    const response = await request('/api/progress/Not_Valid', 'DELETE', await bearer(ALICE));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_page_id' });
  });
});

describe('unknown routes', () => {
  it('answers 404 as JSON without asking for a token', async () => {
    const response = await request('/api/nope');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
