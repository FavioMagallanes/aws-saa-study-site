import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { progressEntrySchema, progressResponseSchema } from '@arquitecto/contracts/progress';
import { createApp } from '../src/app/app.ts';
import { readPages } from '../src/features/progress/data/progress.schema.ts';
import { createDatabase } from '../src/shared/db/client.ts';
import { TEST_DATABASE_URL } from './test-database.ts';

const WRITE_KEY = 'test-write-key-0123456789';
const database = createDatabase(TEST_DATABASE_URL);
let server: Server;
let baseUrl: string;

const request = (path: string, init: RequestInit = {}, key?: string) =>
  fetch(`${baseUrl}${path}`, {
    ...init,
    headers: key === undefined ? {} : { 'x-write-key': key },
  });

const listProgress = async () =>
  progressResponseSchema.parse(await (await request('/api/progress')).json()).entries;

beforeAll(async () => {
  server = createApp({ db: database.db, writeKey: WRITE_KEY }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`;
});

beforeEach(async () => {
  await database.db.delete(readPages);
});

afterAll(async () => {
  server.close();
  await database.close();
});

describe('GET /api/progress', () => {
  it('returns an empty list when nothing was read', async () => {
    const response = await request('/api/progress');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ entries: [] });
  });
});

describe('PUT /api/progress/:pageId', () => {
  it('rejects a request without the write key and stores nothing', async () => {
    const response = await request('/api/progress/amazon-sqs', { method: 'PUT' });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'invalid_write_key' });
    expect(await listProgress()).toEqual([]);
  });

  it('rejects a wrong write key and stores nothing', async () => {
    const response = await request('/api/progress/amazon-sqs', { method: 'PUT' }, 'wrong-key');
    expect(response.status).toBe(401);
    expect(await listProgress()).toEqual([]);
  });

  it('marks a page as read and lists it', async () => {
    const response = await request('/api/progress/amazon-sqs', { method: 'PUT' }, WRITE_KEY);
    expect(response.status).toBe(200);
    const entry = progressEntrySchema.parse(await response.json());
    expect(entry.pageId).toBe('amazon-sqs');
    expect(await listProgress()).toEqual([entry]);
  });

  it('is idempotent: marking twice keeps one entry with the original date', async () => {
    const first = progressEntrySchema.parse(
      await (await request('/api/progress/amazon-sqs', { method: 'PUT' }, WRITE_KEY)).json(),
    );
    const second = progressEntrySchema.parse(
      await (await request('/api/progress/amazon-sqs', { method: 'PUT' }, WRITE_KEY)).json(),
    );
    expect(second).toEqual(first);
    expect(await listProgress()).toEqual([first]);
  });

  it('rejects an invalid page id with 400 and stores nothing', async () => {
    const response = await request('/api/progress/Not_Valid', { method: 'PUT' }, WRITE_KEY);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'invalid_page_id' });
    expect(await listProgress()).toEqual([]);
  });
});

describe('DELETE /api/progress/:pageId', () => {
  it('rejects a request without the write key and keeps the entry', async () => {
    await request('/api/progress/amazon-sqs', { method: 'PUT' }, WRITE_KEY);
    const response = await request('/api/progress/amazon-sqs', { method: 'DELETE' });
    expect(response.status).toBe(401);
    expect(await listProgress()).toHaveLength(1);
  });

  it('marks a page as unread', async () => {
    await request('/api/progress/amazon-sqs', { method: 'PUT' }, WRITE_KEY);
    const response = await request('/api/progress/amazon-sqs', { method: 'DELETE' }, WRITE_KEY);
    expect(response.status).toBe(204);
    expect(await listProgress()).toEqual([]);
  });

  it('succeeds when the page was never read', async () => {
    const response = await request('/api/progress/amazon-sqs', { method: 'DELETE' }, WRITE_KEY);
    expect(response.status).toBe(204);
  });
});

describe('unknown routes', () => {
  it('answers 404 as JSON', async () => {
    const response = await request('/api/nope');
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not_found' });
  });
});
