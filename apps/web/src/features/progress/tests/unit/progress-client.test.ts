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
  it('returns the validated entries', async () => {
    const entry = { pageId: 'amazon-sqs', readAt: '2026-10-29T18:27:31.913Z' };
    stubFetch(() => Promise.resolve(jsonResponse({ entries: [entry] })));
    await expect(fetchProgress()).resolves.toEqual([entry]);
  });

  it('rejects data that does not match the contract', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ entries: [{ pageId: 'Bad Id' }] })));
    expect(await kindOf(fetchProgress())).toBe('failed');
  });

  it('reports an unreachable service as unavailable', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')));
    expect(await kindOf(fetchProgress())).toBe('unavailable');
  });

  it('reports a server error as failed', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'internal_error' }, 500)));
    expect(await kindOf(fetchProgress())).toBe('failed');
  });
});

describe('markPageRead', () => {
  it('sends the write key and returns the stored entry', async () => {
    const entry = { pageId: 'amazon-sqs', readAt: '2026-10-29T18:27:31.913Z' };
    const fetchMock = stubFetch(() => Promise.resolve(jsonResponse(entry)));
    await expect(markPageRead('amazon-sqs', 'secret-key-1234567890')).resolves.toEqual(entry);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('/api/progress/amazon-sqs');
    expect(init).toMatchObject({
      method: 'PUT',
      headers: { 'x-write-key': 'secret-key-1234567890' },
    });
  });

  it('reports a rejected key distinctly from other failures', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'invalid_write_key' }, 401)));
    expect(await kindOf(markPageRead('amazon-sqs', 'wrong'))).toBe('invalid-key');
  });
});

describe('markPageUnread', () => {
  it('resolves on 204 and uses DELETE', async () => {
    const fetchMock = stubFetch(() => Promise.resolve(new Response(null, { status: 204 })));
    await expect(markPageUnread('amazon-sqs', 'secret-key-1234567890')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ method: 'DELETE' });
  });

  it('reports a rejected key', async () => {
    stubFetch(() => Promise.resolve(jsonResponse({ error: 'invalid_write_key' }, 401)));
    expect(await kindOf(markPageUnread('amazon-sqs', 'wrong'))).toBe('invalid-key');
  });
});
