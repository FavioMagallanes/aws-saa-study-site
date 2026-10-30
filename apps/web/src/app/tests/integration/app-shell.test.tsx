import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../render-app';

const renderAt = (path: string) => renderApp(path);

const openMenuPanel = () => {
  const panel = document.getElementById('mobile-menu');
  if (!panel) throw new Error('Mobile menu panel not found');
  return panel;
};

const expectMenuClosedWithFocusOnButton = () => {
  expect(document.getElementById('mobile-menu')).not.toBeInTheDocument();
  expect(screen.queryByTestId('mobile-menu-scrim')).not.toBeInTheDocument();
  const button = screen.getByRole('button', { name: 'Abrir menú' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveFocus();
};

describe('app shell', () => {
  it('marks the current section in the main navigation', async () => {
    await renderAt('/servicios');
    const [nav] = screen.getAllByRole('navigation', { name: 'Principal' });
    if (!nav) throw new Error('Main navigation not found');
    const links = within(nav).getAllByRole('link');
    const current = links.filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.textContent)).toEqual(['Servicios']);
  });

  it('marks Arquitecturas as the current section on its page', async () => {
    await renderAt('/arquitecturas');
    const [nav] = screen.getAllByRole('navigation', { name: 'Principal' });
    if (!nav) throw new Error('Main navigation not found');
    const current = within(nav)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.textContent)).toEqual(['Arquitecturas']);
  });

  it('links the home service index to the Servicios page with the real category count', async () => {
    const { router } = await renderAt('/');
    const index = screen.getByRole('region', { name: 'Índice de servicios' });
    expect(within(index).getByRole('link', { name: 'Ver las 16 categorías' })).toHaveAttribute(
      'href',
      '/servicios',
    );
    const [more] = within(index).getAllByRole('link', { name: /^\+\d+ más$/ });
    if (!more) throw new Error('"+N más" link not found');
    expect(more).toHaveAttribute('href', '/servicios');
    fireEvent.click(more);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Los servicios que cubre la guía' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/servicios');
  });

  it('toggles the theme and announces the next action', async () => {
    await renderAt('/');
    const before = document.documentElement.dataset.theme;
    const toggle = screen.getByRole('button', { name: /Cambiar a modo/ });
    fireEvent.click(toggle);
    expect(document.documentElement.dataset.theme).not.toBe(before);
  });

  it('opens and closes the mobile menu with an accurate expanded state', async () => {
    await renderAt('/');
    const button = screen.getByRole('button', { name: 'Abrir menú' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.getElementById('mobile-menu')).toBeInTheDocument();
  });

  it('opens the menu panel with the four sections and highlights the current route', async () => {
    await renderAt('/servicios');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    const panel = openMenuPanel();
    const links = within(panel).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Ruta',
      'Servicios',
      'Arquitecturas',
      'Glosario',
    ]);
    expect(
      links
        .filter((link) => link.getAttribute('aria-current') === 'page')
        .map((l) => l.textContent),
    ).toEqual(['Servicios']);
    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-controls',
      'mobile-menu',
    );
    expect(screen.getByTestId('mobile-menu-scrim')).toBeInTheDocument();
  });

  it('closes the menu with Escape and returns focus to the menu button', async () => {
    await renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    within(openMenuPanel()).getAllByRole('link')[1]?.focus();
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expectMenuClosedWithFocusOnButton();
  });

  it('closes the menu when the scrim is clicked and returns focus to the menu button', async () => {
    await renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByTestId('mobile-menu-scrim'));
    expectMenuClosedWithFocusOnButton();
  });

  it('closes the menu when a link is chosen, navigates and returns focus to the menu button', async () => {
    const { router } = await renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(within(openMenuPanel()).getByRole('link', { name: 'Glosario' }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/glosario');
    });
    expectMenuClosedWithFocusOnButton();
  });

  it('ignores Escape while the menu is closed', async () => {
    await renderAt('/');
    const search = screen.getByRole('button', { name: 'Buscar servicio, concepto o sigla' });
    search.focus();
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(search).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes the menu when the search dialog is opened from the top bar', async () => {
    await renderAt('/');
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('dialog', { name: 'Buscar en el sitio' })).toBeInTheDocument();
    expect(document.getElementById('mobile-menu')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mobile-menu-scrim')).not.toBeInTheDocument();
  });
});
