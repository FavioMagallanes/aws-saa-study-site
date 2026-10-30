import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { useWriteKeyStore } from '../../store/use-write-key-store';

const KEY = 'secret-key-1234567890';

interface FakeServerOptions {
  readonly putStatus?: number;
  readonly putFails?: boolean;
}

const fakeServer = ({ putStatus = 200, putFails = false }: FakeServerOptions = {}) => {
  const entries: ProgressEntry[] = [];
  const requests: { method: string; key: string | undefined }[] = [];
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

  const handler = (input: string, init?: RequestInit): Promise<Response> => {
    const method = init?.method ?? 'GET';
    const headers = init?.headers as Record<string, string> | undefined;
    requests.push({ method, key: headers?.['x-write-key'] });
    const pageId = input.split('/').pop() ?? '';
    if (method === 'PUT') {
      if (putFails) return Promise.reject(new TypeError('Failed to fetch'));
      if (putStatus !== 200)
        return Promise.resolve(json({ error: 'invalid_write_key' }, putStatus));
      const entry = { pageId, readAt: new Date().toISOString() };
      entries.push(entry);
      return Promise.resolve(json(entry));
    }
    if (method === 'DELETE') {
      entries.splice(0, entries.length, ...entries.filter((entry) => entry.pageId !== pageId));
      return Promise.resolve(new Response(null, { status: 204 }));
    }
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

beforeEach(() => {
  localStorage.clear();
  useWriteKeyStore.setState({ writeKey: undefined });
});

describe('mark as read control', () => {
  it('asks for the write key once, then saves the page as read', async () => {
    const server = fakeServer();
    await renderPage(server);
    fireEvent.click(await findUnreadButton());

    expect(await screen.findByRole('dialog', { name: 'Clave de escritura' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Clave', { selector: 'input' }), {
      target: { value: KEY },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }));

    const readButton = await screen.findByRole('button', { name: 'Leído' });
    expect(readButton).toHaveAttribute('aria-pressed', 'true');
    expect(server.requests.find((request) => request.method === 'PUT')?.key).toBe(KEY);
    expect(useWriteKeyStore.getState().writeKey).toBe(KEY);
  });

  it('does not submit an empty key', async () => {
    const server = fakeServer();
    await renderPage(server);
    fireEvent.click(await findUnreadButton());
    await screen.findByRole('dialog', { name: 'Clave de escritura' });
    expect(screen.getByRole('button', { name: 'Guardar y continuar' })).toBeDisabled();
    expect(server.requests.some((request) => request.method === 'PUT')).toBe(false);
  });

  it('toggles between read and unread with a stored key', async () => {
    useWriteKeyStore.setState({ writeKey: KEY });
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

  it('explains a rejected key, forgets it and leaves the page unread', async () => {
    useWriteKeyStore.setState({ writeKey: 'wrong-key-1234567890' });
    await renderPage(fakeServer({ putStatus: 401 }));
    fireEvent.click(await findUnreadButton());

    expect(
      await screen.findByText('La clave no es válida. Introdúcela de nuevo.'),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(useWriteKeyStore.getState().writeKey).toBeUndefined();
    });
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('keeps the page unread and says so when the service is unreachable', async () => {
    useWriteKeyStore.setState({ writeKey: KEY });
    await renderPage(fakeServer({ putFails: true }));
    fireEvent.click(await findUnreadButton());

    expect(await screen.findByText(/no hay conexión con el servicio/)).toBeInTheDocument();
    expect(await findUnreadButton()).toHaveAttribute('aria-pressed', 'false');
    expect(useWriteKeyStore.getState().writeKey).toBe(KEY);
  });
});

describe('write key dialog', () => {
  const openDialog = async (server = fakeServer()) => {
    await renderPage(server);
    const trigger = await findUnreadButton();
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Clave de escritura' });
    return { dialog, server, trigger };
  };

  it('shows the approved content and focuses the key field', async () => {
    const { dialog } = await openDialog();
    expect(
      within(dialog).getByRole('heading', { level: 2, name: 'Clave de escritura' }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(
        'Para guardar tu progreso necesitas la clave de escritura. Se guarda solo en este navegador.',
      ),
    ).toBeInTheDocument();
    const input = within(dialog).getByLabelText('Clave', { selector: 'input' });
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveFocus();
    expect(within(dialog).getByRole('button', { name: 'Guardar y continuar' })).toHaveAttribute(
      'type',
      'submit',
    );
    expect(within(dialog).getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('closes with Escape without saving and returns focus to the button', async () => {
    const { dialog, server, trigger } = await openDialog();
    const input = within(dialog).getByLabelText('Clave', { selector: 'input' });
    fireEvent.change(input, { target: { value: KEY } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: 'Clave de escritura' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(server.requests.some((request) => request.method === 'PUT')).toBe(false);
    expect(useWriteKeyStore.getState().writeKey).toBeUndefined();
  });

  it('closes from the close button and returns focus to the button', async () => {
    const { dialog, server, trigger } = await openDialog();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByRole('dialog', { name: 'Clave de escritura' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(server.requests.some((request) => request.method === 'PUT')).toBe(false);
  });

  it('returns focus to the mark as read button after saving', async () => {
    const { dialog } = await openDialog();
    fireEvent.change(within(dialog).getByLabelText('Clave', { selector: 'input' }), {
      target: { value: KEY },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar y continuar' }));

    const readButton = await findReadButton();
    expect(screen.queryByRole('dialog', { name: 'Clave de escritura' })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(readButton).toHaveFocus();
    });
  });
});
