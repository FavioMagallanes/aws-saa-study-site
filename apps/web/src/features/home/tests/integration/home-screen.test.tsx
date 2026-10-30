import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { examGuide } from '../../../content/data/load-exam-guide';
import { loadPages } from '../../../content/data/load-pages';
import { FEATURED_SERVICE_CATEGORIES } from '../../model/home-copy';

const renderHome = (progress?: Parameters<typeof renderApp>[1]) => renderApp('/', progress);

const EMPTY_HINT = 'Empieza por Fundamentos; el resto de la ruta sigue el orden de la guía.';
const fundamentalIds = loadPages()
  .filter((page) => page.kind === 'fundamental')
  .map((page) => page.id);
const readAt = '2026-10-29T10:00:00.000Z';

const fundamentalsChapter = () => {
  const route = screen.getByRole('region', { name: 'Ruta guiada' });
  const chapter = within(route)
    .getAllByRole('listitem')
    .find((item) => within(item).queryByRole('heading', { name: 'Fundamentos' }));
  if (!chapter) throw new Error('Fundamentos chapter not found');
  return chapter;
};

describe('Inicio empty state (nothing read yet)', () => {
  it('shows the real total, an empty bar, the start hint and the start button', async () => {
    await renderHome();
    expect(await screen.findByText(`Llevas 0 de 182 páginas`)).toBeInTheDocument();
    expect(screen.getByText(EMPTY_HINT)).toBeInTheDocument();
    expect(screen.queryByText(/Último tema/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Progreso de lectura' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
    expect(screen.getByRole('link', { name: 'Empezar a leer' })).toBeInTheDocument();
  });

  it('shows no read marks or filled bars anywhere on the page', async () => {
    await renderHome();
    await screen.findByText(EMPTY_HINT);
    for (const bar of screen.getAllByRole('progressbar')) {
      expect(bar).toHaveAttribute('aria-valuenow', '0');
    }
    expect(screen.queryByText(/leído/i)).not.toBeInTheDocument();
  });

  it('shows a neutral page count chip on Fundamentos with the real page count', async () => {
    await renderHome();
    await screen.findByText(EMPTY_HINT);
    const chapter = fundamentalsChapter();
    expect(fundamentalIds).toHaveLength(7);
    expect(within(chapter).getByText('0 de 7')).toHaveTextContent('0 de 7 páginas leídas');
    expect(within(chapter).queryByText('Leído')).not.toBeInTheDocument();
  });
});

describe('Inicio Fundamentos chip and hint with progress', () => {
  it('counts the fundamentals read so far and drops the start hint', async () => {
    await renderHome([
      { pageId: 'infraestructura-global-de-aws', readAt },
      { pageId: 'marco-aws-well-architected', readAt },
    ]);
    expect(await screen.findByText('Llevas 2 de 182 páginas')).toBeInTheDocument();
    expect(within(fundamentalsChapter()).getByText('2 de 7')).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_HINT)).not.toBeInTheDocument();
  });

  it('shows the read chip once every fundamental is read', async () => {
    await renderHome(fundamentalIds.map((pageId) => ({ pageId, readAt })));
    expect(await screen.findByText('Llevas 7 de 182 páginas')).toBeInTheDocument();
    const chapter = fundamentalsChapter();
    expect(within(chapter).getByText('Leído')).toHaveTextContent(/^Leído\s*\(leído\)$/);
    expect(within(chapter).queryByText(/ de 7/)).not.toBeInTheDocument();
    expect(
      within(chapter).getByRole('progressbar', { name: 'Progreso de Fundamentos' }),
    ).toHaveAttribute('aria-valuenow', '100');
  });

  it('makes no progress claim on Fundamentos while the progress is loading', async () => {
    await renderApp('/', [], () => new Promise<Response>(() => undefined));
    expect(await screen.findByText('Cargando tu progreso…')).toBeInTheDocument();
    expect(within(fundamentalsChapter()).getByText('Base')).toBeInTheDocument();
    expect(screen.queryByText(/ de 7/)).not.toBeInTheDocument();
    expect(screen.queryByText(EMPTY_HINT)).not.toBeInTheDocument();
  });

  it('makes no progress claim on Fundamentos when the API is unreachable', async () => {
    await renderHome('unavailable');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(within(fundamentalsChapter()).getByText('Base')).toBeInTheDocument();
    expect(screen.queryByText(/ de 7/)).not.toBeInTheDocument();
    expect(screen.queryByText(EMPTY_HINT)).not.toBeInTheDocument();
  });
});

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
