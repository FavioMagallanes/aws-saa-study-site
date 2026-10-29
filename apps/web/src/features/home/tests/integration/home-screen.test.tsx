import { RouterProvider, createMemoryHistory, createRouter } from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { routeTree } from '../../../../routeTree.gen';
import { examGuide } from '../../../content/data/load-exam-guide';
import { FEATURED_SERVICE_CATEGORIES } from '../../model/home-copy';

const renderHome = async () => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
};

describe('Inicio screen with the real content', () => {
  it('shows the empty progress and invites to start reading', async () => {
    await renderHome();
    expect(screen.getByText('Llevas 0 de 182 páginas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar a leer' })).toHaveAttribute(
      'href',
      '/lectura/infraestructura-global-de-aws',
    );
  });

  it('lists the fundamentals and the four exam domains with their weights', async () => {
    await renderHome();
    const route = screen.getByRole('region', { name: 'Ruta guiada' });
    const chapters = within(route).getAllByRole('listitem');
    expect(chapters).toHaveLength(5);
    for (const weight of ['Peso 30 %', 'Peso 26 %', 'Peso 24 %', 'Peso 20 %']) {
      expect(within(route).getByText(weight)).toBeInTheDocument();
    }
  });

  it('links every featured service to its reading page', async () => {
    await renderHome();
    const index = screen.getByRole('region', { name: 'Índice de servicios' });
    expect(within(index).getByRole('link', { name: 'Amazon SQS' })).toHaveAttribute(
      'href',
      '/lectura/amazon-sqs',
    );
  });
});

describe('featured categories copy', () => {
  it('only names categories that exist in the exam guide', () => {
    const categories = new Set(examGuide.services.map((service) => service.category));
    expect(FEATURED_SERVICE_CATEGORIES.filter((name) => !categories.has(name))).toEqual([]);
  });
});
