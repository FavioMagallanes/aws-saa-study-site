import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ProgressRequestError,
  fetchProgress,
  markPageRead,
  markPageUnread,
} from '../../api/progress-client';

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const stubFetch = (impl: (input: string, init?: RequestInit) => Promise<Response>) => {
  const fetchMock = vi.fn(impl);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const TOKEN = 'header.payload.signature';

const kindOf = async (promise: Promise<unknown>): Promise<string | undefined> => {
  try {
    await promise;
    return undefined;
  } catch (error) {
    return error instanceof ProgressRequestError ? error.kind : 'not-a-progress-error';
  }
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchProgress', () => {
  it('asks with the bearer token and returns the validated entries', async () => {
    const entry = { pageId: 'amazon-sqs', readAt: '2026-10-29T18:27:31.913Z' };
    const fetchMock = stubFetch(() => Promise.resolve(jsonResponse({ entries: [entry] })));
    await expect(fetchProgress(TOKEN)).resolves.toEqual([entry]);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/progress');
    expect(init).toMatchObject({ headers: { authorization: `Bearer ${TOKEN}` } });
  });

  it('reports a rejected token as unauthorized', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'unauthorized' }, 401)));
    expect(await kindOf(fetchProgress(TOKEN))).toBe('unauthorized');
  });

  it('rejects data that does not match the contract', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ entries: [{ pageId: 'Bad Id' }] })));
    expect(await kindOf(fetchProgress(TOKEN))).toBe('failed');
  });

  it('reports an unreachable service as unavailable', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await kindOf(fetchProgress(TOKEN))).toBe('unavailable');
  });

  it('reports a server error as failed', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'internal_error' }, 500)));
    expect(await kindOf(fetchProgress(TOKEN))).toBe('failed');
  });
});

describe('markPageRead', () => {
  it('sends the bearer token and returns the stored entry', async () => {
    const entry = { pageId: 'amazon-sqs', readAt: '2026-10-29T18:27:31.913Z' };
    const fetchMock = stubFetch(() => Promise.resolve(jsonResponse(entry)));
    await expect(markPageRead('amazon-sqs', TOKEN)).resolves.toEqual(entry);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/progress/amazon-sqs');
    expect(init).toMatchObject({
      method: 'PUT',
      headers: { authorization: `Bearer ${TOKEN}` },
    });
    expect(JSON.stringify(init)).not.toContain('x-write-key');
  });

  it('reports a rejected token distinctly from other failures', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'unauthorized' }, 401)));
    expect(await kindOf(markPageRead('amazon-sqs', 'wrong'))).toBe('unauthorized');
  });
});

describe('markPageUnread', () => {
  it('resolves on 204 and uses DELETE with the bearer token', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(new Response(null, { status: 204 })));
    await expect(markPageUnread('amazon-sqs', TOKEN)).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: 'DELETE',
      headers: { authorization: `Bearer ${TOKEN}` },
    });
  });

  it('reports a rejected token', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'unauthorized' }, 401)));
    expect(await kindOf(markPageUnread('amazon-sqs', 'wrong'))).toBe('unauthorized');
  });
});
