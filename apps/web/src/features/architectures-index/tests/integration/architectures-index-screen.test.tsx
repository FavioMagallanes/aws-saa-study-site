import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';
import { loadPages } from '../../../content/data/load-pages';

const renderArchitectures = (progress?: Parameters<typeof renderApp>[1]) =>
  renderApp('/arquitecturas', progress);

const readAt = '2026-10-29T10:00:00.000Z';
const INTRO =
  'Los 57 temas transversales, ordenados por los cuatro dominios del examen. Cada uno explica qué problema resuelve y cuándo elegir una opción u otra.';

const DOMAINS = [
  { id: 1, title: 'Diseño de arquitecturas seguras', weight: 30, category: 'Seguridad', count: 12 },
  {
    id: 2,
    title: 'Diseño de arquitecturas resistentes',
    weight: 26,
    category: 'Resiliencia',
    count: 18,
  },
  {
    id: 3,
    title: 'Diseño de arquitecturas de alto rendimiento',
    weight: 24,
    category: 'Rendimiento',
    count: 17,
  },
  {
    id: 4,
    title: 'Diseño de arquitecturas con optimización de costos',
    weight: 20,
    category: 'Costos',
    count: 10,
  },
] as const;

const pages = loadPages();
const topicsOf = (category: string) =>
  pages
    .filter((page) => page.kind === 'topic' && page.category === category)
    .sort((a, b) => a.order - b.order);

const domainSection = (title: string) => screen.getByRole('region', { name: title });

describe('Arquitecturas page with the real content', () => {
  it('shows the eyebrow, the title and the intro with the real topic count', async () => {
    await renderArchitectures();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Los temas que conectan los servicios' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Arquitecturas', { selector: 'p' })).toBeInTheDocument();
    expect(screen.getByText(INTRO)).toBeInTheDocument();
  });

  it('shows the four exam domains with their eyebrow, title and weight', async () => {
    await renderArchitectures();
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(
      DOMAINS.map((domain) => domain.title),
    );
    for (const domain of DOMAINS) {
      const section = domainSection(domain.title);
      expect(within(section).getByText(`Dominio ${String(domain.id)}`)).toBeInTheDocument();
      expect(within(section).getByText(`Peso ${String(domain.weight)} %`)).toBeInTheDocument();
    }
  });

  it('lists the topics of each domain in guide order as links to their pages', async () => {
    await renderArchitectures();
    for (const domain of DOMAINS) {
      const topics = topicsOf(domain.category);
      expect(topics).toHaveLength(domain.count);
      const links = within(within(domainSection(domain.title)).getByRole('list')).getAllByRole(
        'link',
      );
      expect(links.map((link) => link.textContent)).toEqual(topics.map((topic) => topic.title));
      expect(links.map((link) => link.getAttribute('href'))).toEqual(
        topics.map((topic) => `/lectura/${topic.id}`),
      );
    }
  });

  it('does not list the fundamentals or the services', async () => {
    await renderArchitectures();
    const hrefs = new Set(
      within(screen.getByRole('main'))
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    );
    expect(hrefs.size).toBe(57);
    for (const page of pages.filter((p) => p.kind !== 'topic')) {
      expect(hrefs.has(`/lectura/${page.id}`)).toBe(false);
    }
  });

  it('counts, fills the bar and marks the topics read in the progress API', async () => {
    const [first, second] = topicsOf('Seguridad');
    if (!first || !second) throw new Error('Security topics not found');
    await renderArchitectures([
      { pageId: first.id, readAt },
      { pageId: second.id, readAt },
    ]);
    const security = domainSection('Diseño de arquitecturas seguras');
    expect(await within(security).findByText('2 de 12 leídos')).toBeInTheDocument();
    expect(within(security).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '17');
    const firstItem = within(security).getByRole('link', { name: first.title }).closest('li');
    expect(firstItem).toHaveTextContent('(leído)');
    expect(screen.getAllByText('(leído)')).toHaveLength(2);
    const costs = domainSection('Diseño de arquitecturas con optimización de costos');
    expect(within(costs).getByText('0 de 10 leídos')).toBeInTheDocument();
    expect(within(costs).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('shows every topic unmarked and makes no count claim while the progress loads', async () => {
    await renderApp('/arquitecturas', [], () => new Promise<Response>(() => undefined));
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
    expect(screen.queryByText(/ de \d+ leídos$/)).not.toBeInTheDocument();
  });

  it('keeps the topics and shows the progress notice when the API is unreachable', async () => {
    await renderArchitectures('unavailable');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar tu progreso');
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
    expect(screen.queryByText('(leído)')).not.toBeInTheDocument();
    expect(screen.queryByText(/ de \d+ leídos$/)).not.toBeInTheDocument();
  });
});
