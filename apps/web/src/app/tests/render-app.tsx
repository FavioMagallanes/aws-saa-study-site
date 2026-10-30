import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { vi } from 'vitest';
import { routeTree } from '../../routeTree.gen';

// Stubs only the network boundary: the app talks to the progress API through fetch.
export const renderApp = async (
  path: string,
  progress: readonly ProgressEntry[] | 'unavailable' = [],
  fetchOverride?: (input: string, init?: RequestInit) => Promise<Response>,
) => {
  vi.stubGlobal(
    'fetch',
    fetchOverride ??
      vi.fn(() =>
        progress === 'unavailable'
          ? Promise.reject(new TypeError('Failed to fetch'))
          : Promise.resolve(
              new Response(JSON.stringify({ entries: progress }), {
                status: 200,
                headers: { 'content-type': 'application/json' },
              }),
            ),
      ),
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router };
};

// Screens may carry their own <header>; the site top bar is always the first banner.
export const getTopBar = (): HTMLElement => {
  const [topBar] = screen.getAllByRole('banner');
  if (!topBar) throw new Error('Top bar not found');
  return topBar;
};
