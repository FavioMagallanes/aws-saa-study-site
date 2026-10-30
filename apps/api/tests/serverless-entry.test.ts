import { createServer, type RequestListener, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { progressResponseSchema } from '@arquitecto/contracts/progress';
import { readPages } from '../src/features/progress/data/progress.schema.ts';
import { createDatabase } from '../src/shared/db/client.ts';
import { startTestIssuer, type TestIssuer } from './test-auth.ts';
import { TEST_DATABASE_URL } from './test-database.ts';

const USER_ID = 'dc42fa70-09a7-4038-a3bb-f61dda854910';
const OTHER_USER_ID = '5b1c1f0e-7a52-4c1e-9f8e-0f4a2d6b9c11';
const UNAUTHORIZED = { error: 'unauthorized' };
const STORED = [
  { userId: USER_ID, pageId: 'amazon-s3', readAt: new Date('2026-01-02T03:04:05.000Z') },
  { userId: USER_ID, pageId: 'amazon-sqs', readAt: new Date('2026-02-03T04:05:06.000Z') },
];
const OTHER_STORED = {
  userId: OTHER_USER_ID,
  pageId: 'aws-lambda',
  readAt: new Date('2026-03-04T05:06:07.000Z'),
};
const STORED_ENTRIES = STORED.map(({ pageId, readAt }) => ({
  pageId,
  readAt: readAt.toISOString(),
}));

const database = createDatabase(TEST_DATABASE_URL);
const previousEnv = { ...process.env };
let issuer: TestIssuer;
let server: Server;
let baseUrl: string;

const request = (path: string, init: RequestInit = {}) => fetch(`${baseUrl}${path}`, init);

const authorized = async (method = 'GET'): Promise<RequestInit> => ({
  method,
  headers: { authorization: `Bearer ${await issuer.sign({ sub: USER_ID })}` },
});

const listProgress = async () =>
  progressResponseSchema.parse(await (await request('/api/progress', await authorized())).json())
    .entries;

beforeAll(async () => {
  issuer = await startTestIssuer();
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.NEON_AUTH_JWKS_URL = issuer.jwksUrl;
  // The Vercel entry reads its configuration when the module is first evaluated, so it is imported
  // only after the environment is set. The file URL resolves it outside this package's Vite root.
  const entryUrl = new URL('../../../api/index.ts', import.meta.url).href;
  const entry = (await import(entryUrl)) as { default: RequestListener };
  server = createServer(entry.default).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

beforeEach(async () => {
  await database.db.delete(readPages);
  await database.db.insert(readPages).values([...STORED, OTHER_STORED]);
});

afterAll(async () => {
  server.close();
  await database.db.delete(readPages);
  await database.close();
  await issuer.close();
  process.env = previousEnv;
});

describe('Vercel function entry (api/index.ts)', () => {
  it('answers GET /api/progress with only the caller stored entries', async () => {
    const response = await request('/api/progress', await authorized());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entries: STORED_ENTRIES });
  });

  it('rejects a GET without a token', async () => {
    const response = await request('/api/progress');
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(UNAUTHORIZED);
  });

  it('rejects a PUT without a token and leaves the stored data unchanged', async () => {
    const response = await request('/api/progress/aws-lambda', { method: 'PUT' });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(UNAUTHORIZED);
    expect(await listProgress()).toEqual(STORED_ENTRIES);
  });

  it('rejects a DELETE without a token and leaves the stored data unchanged', async () => {
    const response = await request('/api/progress/amazon-s3', { method: 'DELETE' });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual(UNAUTHORIZED);
    expect(await listProgress()).toEqual(STORED_ENTRIES);
  });

  it('accepts a write with a valid Neon Auth token', async () => {
    const response = await request('/api/progress/amazon-s3', await authorized('DELETE'));
    expect(response.status).toBe(204);
    expect(await listProgress()).toEqual(STORED_ENTRIES.slice(1));
  });

  it('answers unknown API routes with the JSON 404', async () => {
    const response = await request('/api/nope');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
