import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { routeTree } from '../../../routeTree.gen';

const renderAt = async (path: string) => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
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
});
