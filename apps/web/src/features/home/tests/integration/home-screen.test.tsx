import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { examGuide } from '../../../content/data/load-exam-guide';
import { FEATURED_SERVICE_CATEGORIES } from '../../model/home-copy';

const renderHome = (progress?: Parameters<typeof renderApp>[1]) => renderApp('/', progress);

describe('Inicio screen with the real content', () => {
  it('shows the empty progress and invites to start reading', async () => {
    await renderHome();
    expect(await screen.findByText('Llevas 0 de 182 páginas')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar a leer' })).toHaveAttribute(
      'href',
      '/lectura/infraestructura-global-de-aws',
    );
  });

  it('shows the progress stored in the API and offers to continue', async () => {
    await renderHome([
      { pageId: 'infraestructura-global-de-aws', readAt: '2026-10-29T10:00:00.000Z' },
      { pageId: 'amazon-sqs', readAt: '2026-10-29T12:00:00.000Z' },
    ]);
    expect(await screen.findByText('Llevas 2 de 182 páginas')).toBeInTheDocument();
    expect(screen.getByText('Último tema: Amazon SQS')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar leyendo' })).toBeInTheDocument();
  });

  it('does not claim zero progress when the API is unreachable', async () => {
    await renderHome('unavailable');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar tu progreso');
    expect(screen.getByText('Tu progreso no está disponible ahora')).toBeInTheDocument();
    expect(screen.queryByText(/Llevas 0 de/)).not.toBeInTheDocument();
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
