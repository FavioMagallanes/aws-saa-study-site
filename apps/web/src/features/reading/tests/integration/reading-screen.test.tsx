import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

const renderAt = (path: string) => renderApp(path);

describe('reading page with the real content', () => {
  it('shows the page title, its exam tasks and the pending body', async () => {
    await renderAt('/lectura/amazon-sqs');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Amazon SQS' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'En el examen' })).toBeInTheDocument();
    expect(screen.getByText('Contenido pendiente.')).toBeInTheDocument();
  });

  it('marks the current page in the sidebar', async () => {
    await renderAt('/lectura/amazon-sqs');
    const nav = await screen.findByRole('navigation', { name: 'Páginas relacionadas' });
    const current = within(nav)
      .getAllByRole('link')
      .filter((l) => l.getAttribute('aria-current') === 'page');
    expect(current.map((link) => link.textContent)).toEqual(['Amazon SQS']);
  });

  it('links to the previous and next pages', async () => {
    await renderAt('/lectura/amazon-sqs');
    const pager = await screen.findByRole('navigation', { name: 'Página anterior y siguiente' });
    expect(within(pager).getAllByRole('link')).toHaveLength(2);
  });

  it('shows a not-found message for an unknown page', async () => {
    await renderAt('/lectura/no-existe');
    expect(
      await screen.findByRole('heading', { name: 'Página no encontrada' }),
    ).toBeInTheDocument();
  });
});
