import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

const renderGlossary = () => renderApp('/glosario');

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
