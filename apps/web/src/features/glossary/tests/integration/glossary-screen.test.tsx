import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { routeTree } from '../../../../routeTree.gen';

const renderGlossary = async () => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/glosario'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
};

describe('Glosario with the real data', () => {
  it('lists the entries grouped by letter', async () => {
    await renderGlossary();
    expect(await screen.findByRole('heading', { level: 2, name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'ACM' })).toBeInTheDocument();
  });

  it('filters the entries while typing', async () => {
    await renderGlossary();
    fireEvent.change(await screen.findByRole('searchbox', { name: 'Filtrar siglas' }), {
      target: { value: 'rpo' },
    });
    expect(screen.getByRole('heading', { level: 3, name: 'RPO' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'ACM' })).not.toBeInTheDocument();
  });

  it('says so when nothing matches and keeps the typed text', async () => {
    await renderGlossary();
    const input = await screen.findByRole('searchbox', { name: 'Filtrar siglas' });
    fireEvent.change(input, { target: { value: 'zzzz' } });
    expect(screen.getByText('No hay siglas que coincidan con «zzzz».')).toBeInTheDocument();
    expect(input).toHaveValue('zzzz');
  });

  it('only offers letter links for letters that have entries', async () => {
    await renderGlossary();
    const links = await screen.findAllByRole('link', { name: /^[A-Z]$/ });
    expect(links.some((link) => link.getAttribute('href') === '#letra-A')).toBe(true);
    expect(links.some((link) => link.getAttribute('href') === '#letra-Q')).toBe(false);
  });
});
