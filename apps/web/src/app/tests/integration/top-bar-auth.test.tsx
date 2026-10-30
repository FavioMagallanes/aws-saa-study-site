import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import type { ProgressEntry } from '@arquitecto/contracts/progress';
import { describe, expect, it, vi } from 'vitest';
import { loadPages } from '../../../features/content/data/load-pages';
import { fakeAuth } from '../fake-auth-client';
import { getTopBar, renderApp } from '../render-app';

const TOTAL_PAGES = loadPages().length;
const SIGNED_OUT_NOTICE = 'Inicia sesión para guardar tu progreso';

const entries: ProgressEntry[] = [
  { pageId: 'amazon-sqs', readAt: '2026-10-29T10:00:00.000Z' },
  { pageId: 'amazon-sns', readAt: '2026-10-29T12:00:00.000Z' },
];

const progressRequests = () =>
  vi
    .mocked(fetch)
    .mock.calls.filter(([input]) => typeof input === 'string' && input.startsWith('/api/progress'));

const openUserMenu = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Tu cuenta' }));
  const menu = document.getElementById('user-menu');
  if (!menu) throw new Error('User menu panel not found');
  return menu;
};

describe('top bar when signed out', () => {
  it('offers "Iniciar sesión" that keeps the current page to come back to', async () => {
    fakeAuth.session = null;
    const { router } = await renderApp('/servicios');
    const header = getTopBar();
    const signIn = await within(header).findByRole('link', { name: 'Iniciar sesión' });
    expect(signIn).toHaveAttribute('href', '/acceso?returnTo=%2Fservicios');
    expect(within(header).queryByRole('button', { name: 'Tu cuenta' })).not.toBeInTheDocument();

    fireEvent.click(signIn);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/acceso');
    });
    expect(router.state.location.search).toEqual({ returnTo: '/servicios' });
  });

  it('keeps reading open: no progress request, nothing marked and a quiet invitation', async () => {
    fakeAuth.session = null;
    await renderApp('/servicios', entries);
    const notice = await screen.findByText(SIGNED_OUT_NOTICE);
    expect(notice.closest('a')).toHaveAttribute('href', '/acceso?returnTo=%2Fservicios');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
    expect(progressRequests()).toHaveLength(0);
  });

  it('stays readable and signed out when the auth service is down', async () => {
    fakeAuth.sessionFails = true;
    await renderApp('/servicios', entries);
    expect(await screen.findByText(SIGNED_OUT_NOTICE)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Los servicios que cubre la guía' }),
    ).toBeInTheDocument();
    expect(progressRequests()).toHaveLength(0);
  });
});

describe('top bar when signed in', () => {
  it('shows the avatar with the initials and no sign-in button or invitation', async () => {
    await renderApp('/', entries);
    const avatar = await screen.findByRole('button', { name: 'Tu cuenta' });
    expect(avatar).toHaveTextContent('AL');
    expect(avatar).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Iniciar sesión' })).not.toBeInTheDocument();
    expect(screen.queryByText(SIGNED_OUT_NOTICE)).not.toBeInTheDocument();
  });

  it('opens the menu with the name, the email, the real progress and sign out', async () => {
    await renderApp('/servicios', entries);
    await screen.findByRole('button', { name: 'Tu cuenta' });
    const menu = openUserMenu();
    expect(screen.getByRole('button', { name: 'Tu cuenta' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(menu).getByText('Ana López')).toBeInTheDocument();
    expect(within(menu).getByText('ana@example.com')).toBeInTheDocument();
    const progress = await within(menu).findByRole('link', {
      name: `Mi progreso 2 de ${String(TOTAL_PAGES)}`,
    });
    expect(progress).toHaveAttribute('href', '/');
    expect(within(menu).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('closes the menu with Escape and returns focus to the avatar', async () => {
    await renderApp('/', entries);
    await screen.findByRole('button', { name: 'Tu cuenta' });
    const menu = openUserMenu();
    within(menu).getByRole('button', { name: 'Cerrar sesión' }).focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(document.getElementById('user-menu')).not.toBeInTheDocument();
    const avatar = screen.getByRole('button', { name: 'Tu cuenta' });
    expect(avatar).toHaveAttribute('aria-expanded', 'false');
    expect(avatar).toHaveFocus();
  });

  it('closes the menu when "Mi progreso" is chosen and goes to the home page', async () => {
    const { router } = await renderApp('/servicios', entries);
    await screen.findByRole('button', { name: 'Tu cuenta' });
    const menu = openUserMenu();
    fireEvent.click(await within(menu).findByRole('link', { name: /^Mi progreso/ }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(document.getElementById('user-menu')).not.toBeInTheDocument();
  });

  it('signs out and shows the signed-out state with nothing marked', async () => {
    await renderApp('/servicios', entries);
    await screen.findAllByText('(leído)');
    const menu = openUserMenu();
    fireEvent.click(within(menu).getByRole('button', { name: 'Cerrar sesión' }));

    expect(
      await within(getTopBar()).findByRole('link', { name: 'Iniciar sesión' }),
    ).toBeInTheDocument();
    expect(fakeAuth.signOutCalls).toBe(1);
    expect(screen.queryByRole('button', { name: 'Tu cuenta' })).not.toBeInTheDocument();
    expect(screen.getByText(SIGNED_OUT_NOTICE)).toBeInTheDocument();
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
  });
});
