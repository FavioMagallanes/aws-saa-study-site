import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useReadingProgress } from '../../hooks/use-reading-progress';
import { useSetPageRead } from '../../hooks/use-set-page-read';
import { useWriteKeyStore } from '../../store/use-write-key-store';

const wrapper = ({ children }: { children: ReactNode }) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const entry = (pageId: string, readAt: string) => ({ pageId, readAt });

const useBoth = () => ({ progress: useReadingProgress(), setRead: useSetPageRead() });

beforeEach(() => {
  useWriteKeyStore.setState({ writeKey: 'secret-key-1234567890' });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useReadingProgress', () => {
  it('exposes the read pages and the most recently read one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          json({
            entries: [
              entry('amazon-sqs', '2026-10-29T10:00:00.000Z'),
              entry('amazon-sns', '2026-10-29T12:00:00.000Z'),
            ],
          }),
        ),
      ),
    );
    const { result } = renderHook(() => useReadingProgress(), { wrapper });
    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });
    expect([...result.current.readPageIds].sort()).toEqual(['amazon-sns', 'amazon-sqs']);
    expect(result.current.lastReadPageId).toBe('amazon-sns');
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

  it('rolls the page back to unread when the key is rejected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_input: string, init?: RequestInit) =>
        Promise.resolve(
          init?.method === 'PUT'
            ? json({ error: 'invalid_write_key' }, 401)
            : json({ entries: [] }),
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
    expect(result.current.setRead.error).toMatchObject({ kind: 'invalid-key' });
  });

  it('refuses to send a request when no write key is stored', async () => {
    useWriteKeyStore.setState({ writeKey: undefined });
    const fetchMock = vi.fn((_input: string, _init?: RequestInit) =>
      Promise.resolve(json({ entries: [] })),
    );
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useBoth(), { wrapper });
    await waitFor(() => {
      expect(result.current.progress.status).toBe('ready');
    });
    act(() => {
      result.current.setRead.mutate({ pageId: 'amazon-sqs', read: true });
    });
    await waitFor(() => {
      expect(result.current.setRead.error).toMatchObject({ kind: 'missing-key' });
    });
    expect(fetchMock.mock.calls.every(([, init]) => init?.method !== 'PUT')).toBe(true);
  });
});
