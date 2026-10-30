import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TEST_ACCESS_TOKEN, fakeAuth } from '../../../../app/tests/fake-auth-client';
import { useReadingProgress } from '../../hooks/use-reading-progress';
import { useSetPageRead } from '../../hooks/use-set-page-read';

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const entry = (pageId: string, readAt: string) => ({ pageId, readAt });

const useBoth = () => ({ progress: useReadingProgress(), setRead: useSetPageRead() });

const authorizationOf = (init: RequestInit | undefined) =>
  new Headers(init?.headers).get('authorization');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useReadingProgress', () => {
  it('exposes the read pages and the most recently read one, asking with the access token', async () => {
    const fetchMock = vi.fn((_input: string, _init?: RequestInit) =>
      Promise.resolve(
        json({
          entries: [
            entry('amazon-sqs', '2026-10-29T10:00:00.000Z'),
            entry('amazon-sns', '2026-10-29T12:00:00.000Z'),
          ],
        }),
      ),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useReadingProgress(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.signedIn).toBe(true);
    expect([...result.current.readPageIds].sort()).toEqual(['amazon-sns', 'amazon-sqs']);
    expect(result.current.lastReadPageId).toBe('amazon-sns');
    expect(authorizationOf(fetchMock.mock.calls[0]?.[1])).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
  });

  it('reports an error instead of an empty list when the API is down', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );
    const { result } = renderHook(() => useReadingProgress(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(result.current.readPageIds.size).toBe(0);
  });

  it('does not ask the API and marks nothing when signed out', async () => {
    fakeAuth.session = null;
    const fetchMock = vi.fn(() => Promise.resolve(json({ entries: [] })));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useReadingProgress(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect(result.current.signedIn).toBe(false);
    expect(result.current.readPageIds.size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('useSetPageRead', () => {
  it('marks a page as read immediately and keeps it after the server confirms', async () => {
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: string, init?: RequestInit) => {
        calls.push(init?.method ?? 'GET');
        return Promise.resolve(
          init?.method === 'PUT'
            ? json(entry('amazon-sqs', '2026-10-29T12:00:00.000Z'))
            : json({
                entries: calls.includes('PUT')
                  ? [entry('amazon-sqs', '2026-10-29T12:00:00.000Z')]
                  : [],
              }),
        );
      }),
    );
    const { result } = renderHook(() => useBoth(), { wrapper });
    await waitFor(() => {
      expect(result.current.progress.status).toBe('ready');
    });
    act(() => {
      result.current.setRead.mutate({ pageId: 'amazon-sqs', read: true });
    });
    await waitFor(() => {
      expect(result.current.progress.readPageIds.has('amazon-sqs')).toBe(true);
    });
    await waitFor(() => {
      expect(result.current.setRead.isSuccess).toBe(true);
    });
    expect(result.current.progress.readPageIds.has('amazon-sqs')).toBe(true);
  });

  it('rolls the page back to unread and signs the visitor out when the token is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: string, init?: RequestInit) =>
        Promise.resolve(
          init?.method === 'PUT' ? json({ error: 'unauthorized' }, 401) : json({ entries: [] }),
        ),
      ),
    );
    const { result } = renderHook(() => useBoth(), { wrapper });
    await waitFor(() => {
      expect(result.current.progress.status).toBe('ready');
    });
    act(() => {
      result.current.setRead.mutate({ pageId: 'amazon-sqs', read: true });
    });
    await waitFor(() => {
      expect(result.current.setRead.isError).toBe(true);
    });
    expect(result.current.progress.readPageIds.has('amazon-sqs')).toBe(false);
    expect(result.current.setRead.error).toMatchObject({ kind: 'unauthorized' });
    await waitFor(() => {
      expect(result.current.progress.signedIn).toBe(false);
    });
  });

  it('refuses to send a request when there is no session', async () => {
    fakeAuth.session = null;
    const fetchMock = vi.fn((_input: string, _init?: RequestInit) =>
      Promise.resolve(json({ entries: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useBoth(), { wrapper });
    await waitFor(() => {
      expect(result.current.progress.status).toBe('ready');
    });
    expect(result.current.progress.signedIn).toBe(false);
    act(() => {
      result.current.setRead.mutate({ pageId: 'amazon-sqs', read: true });
    });
    await waitFor(() => {
      expect(result.current.setRead.error).toMatchObject({ kind: 'unauthorized' });
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
