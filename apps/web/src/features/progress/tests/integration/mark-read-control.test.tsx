import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { describe, expect, it } from 'vitest';
import { TEST_ACCESS_TOKEN, fakeAuth } from '../../../../app/tests/fake-auth-client';
import { getTopBar, renderApp } from '../../../../app/tests/render-app';

interface FakeServerOptions {
  readonly getStatus?: number;
  readonly putStatus?: number;
  readonly putFails?: boolean;
}

const fakeServer = ({
  getStatus = 200,
  putStatus = 200,
  putFails = false,
}: FakeServerOptions = {}) => {
  const entries: ProgressEntry[] = [];
  const requests: { method: string; authorization: string | undefined }[] = [];
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const handler = (input: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = new Headers(init?.headers);
    requests.push({ method, authorization: headers.get('authorization') ?? undefined });
    const pageId = input.split('/').pop() ?? '';
    if (method === 'PUT') {
      if (putFails) return Promise.reject(new TypeError('Failed to fetch'));
      if (putStatus !== 200) return Promise.resolve(json({ error: 'unauthorized' }, putStatus));
      const entry = { pageId, readAt: new Date().toISOString() };
      entries.push(entry);
      return Promise.resolve(json(entry));
    }
    if (method === 'DELETE') {
      entries.splice(0, entries.length, ...entries.filter((entry) => entry.pageId !== pageId));
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    if (getStatus !== 200) return Promise.resolve(json({ error: 'unauthorized' }, getStatus));
    return Promise.resolve(json({ entries }));
  };
  return { handler, requests };
};

const renderPage = (server: ReturnType<typeof fakeServer>) =>
  renderApp('/lectura/amazon-sqs', [], server.handler);

const findUnreadButton = async () => {
  const button = await screen.findByRole('button', { name: 'Marcar como leído' });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  return button;
};

const findReadButton = async () => {
  const button = await screen.findByRole('button', { name: 'Leído' });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  return button;
};

const expectSignedOutState = async () => {
  expect(
    await within(getTopBar()).findByRole('link', { name: 'Iniciar sesión' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Tu cuenta' })).not.toBeInTheDocument();
  expect(screen.getByText('Inicia sesión para guardar tu progreso')).toBeInTheDocument();
};

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

describe('mark as read control when signed in', () => {
  it('saves the page as read with the session access token', async () => {
    const server = fakeServer();
    await renderPage(server);
    fireEvent.click(await findUnreadButton());

    expect(await findReadButton()).toHaveAttribute('aria-pressed', 'true');
    expect(server.requests.map((request) => request.method)).toContain('PUT');
    for (const request of server.requests) {
      expect(request.authorization).toBe(`Bearer ${TEST_ACCESS_TOKEN}`);
    }
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('toggles between read and unread', async () => {
    const server = fakeServer();
    await renderPage(server);

    fireEvent.click(await findUnreadButton());
    fireEvent.click(await findReadButton());
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
    expect(server.requests.map((request) => request.method).filter((m) => m !== 'GET')).toEqual([
      'PUT',
      'DELETE',
    ]);
  });

  it('keeps the page unread and says so when the service is unreachable', async () => {
    await renderPage(fakeServer({ putFails: true }));
    fireEvent.click(await findUnreadButton());

    expect(await screen.findByText(/no hay conexión con el servicio/)).toBeInTheDocument();
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Tu cuenta' })).toBeInTheDocument();
  });

  it('rolls back and shows the signed-out state when the API rejects the token', async () => {
    const server = fakeServer({ putStatus: 401 });
    await renderPage(server);
    fireEvent.click(await findUnreadButton());

    expect(
      await screen.findByText('Tu sesión ya no es válida. Inicia sesión de nuevo.'),
    ).toBeInTheDocument();
    await expectSignedOutState();
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('mark as read control when signed out', () => {
  it('sends the visitor to Acceso and keeps the page to come back to', async () => {
    fakeAuth.session = null;
    const server = fakeServer();
    const { router } = await renderPage(server);
    fireEvent.click(await findUnreadButton());

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/acceso');
    });
    expect(router.state.location.search).toEqual({ returnTo: '/lectura/amazon-sqs' });
    expect(server.requests).toHaveLength(0);
  });
});

describe('progress API rejecting the session', () => {
  it('shows the signed-out state after one rejected request and does not retry', async () => {
    const server = fakeServer({ getStatus: 401 });
    await renderPage(server);

    await expectSignedOutState();
    await settle();
    expect(server.requests).toEqual([
      { method: 'GET', authorization: `Bearer ${TEST_ACCESS_TOKEN}` },
    ]);
    expect(screen.queryByText(/No se pudo cargar tu progreso/)).not.toBeInTheDocument();
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
  });
});
