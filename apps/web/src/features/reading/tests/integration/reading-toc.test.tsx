import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

// jsdom has no layout: each test places the headings by stubbing their viewport position.
const placeHeadings = (headings: readonly HTMLElement[], tops: readonly number[]) => {
  headings.forEach((heading, index) => {
    vi.spyOn(heading, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, tops[index] ?? 0, 600, 40),
    );
  });
  fireEvent.scroll(window);
};

const WIDE_LAYOUT_QUERY = '(min-width: 1100px)';

const stubViewport = (wide: boolean) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: wide && query === WIDE_LAYOUT_QUERY,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
};

const renderSqsPage = async () => {
  stubViewport(true);
  await renderApp('/lectura/amazon-sqs');
  const toc = await screen.findByRole('navigation', { name: 'En esta página' });
  const links = within(toc).getAllByRole('link');
  const headings = within(screen.getByRole('main')).getAllByRole('heading', { level: 2 });
  return { links, headings };
};

const currentLinks = (links: readonly HTMLElement[]) =>
  links
    .filter((link) => link.getAttribute('aria-current') === 'location')
    .map((link) => link.textContent);

describe('reading table of contents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    stubViewport(false);
  });

  it('shows the full list beside the article from 1100px, without a toggle', async () => {
    await renderSqsPage();
    const toc = screen.getByRole('navigation', { name: 'En esta página' });
    expect(
      within(screen.getByRole('main')).queryByRole('navigation', { name: 'En esta página' }),
    ).toBeNull();
    expect(within(toc).queryByRole('button')).toBeNull();
    expect(within(toc).getAllByRole('link')).toHaveLength(5);
  });

  it('starts collapsed inside the article column below 1100px', async () => {
    stubViewport(false);
    await renderApp('/lectura/amazon-sqs');
    const main = await screen.findByRole('main');
    const toc = await within(main).findByRole('navigation', { name: 'En esta página' });
    const toggle = within(toc).getByRole('button', { name: 'En esta página' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(toc).queryAllByRole('link')).toEqual([]);
    expect(screen.getAllByRole('navigation', { name: 'En esta página' })).toHaveLength(1);
  });

  it('expands and collapses the list below 1100px with the toggle', async () => {
    stubViewport(false);
    await renderApp('/lectura/amazon-sqs');
    const toc = await screen.findByRole('navigation', { name: 'En esta página' });
    const toggle = within(toc).getByRole('button', { name: 'En esta página' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const list = within(toc).getByRole('list');
    expect(toggle).toHaveAttribute('aria-controls', list.id);
    expect(
      within(list)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual([
      '#que-problema-resuelve',
      '#conceptos-clave',
      '#como-se-conecta-con-otros-servicios',
      '#como-elegir',
      '#fuentes-oficiales',
    ]);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(toc).queryAllByRole('link')).toEqual([]);
  });

  it('lists every section heading of the real page as an in-page link', async () => {
    const { links, headings } = await renderSqsPage();
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      headings.map((heading) => `#${heading.id}`),
    );
    expect(links.map((link) => link.textContent)).toEqual([
      'Qué problema resuelve',
      'Conceptos clave',
      'Cómo se conecta con otros servicios',
      'Cómo elegir',
      'Fuentes oficiales',
    ]);
  });

  it('marks no section while the reader is still in the introduction', async () => {
    const { links, headings } = await renderSqsPage();
    placeHeadings(headings, [400, 1400, 2400, 3400, 4400]);
    await waitFor(() => {
      expect(currentLinks(links)).toEqual([]);
    });
  });

  it('marks the last section whose heading has scrolled past the top', async () => {
    const { links, headings } = await renderSqsPage();
    placeHeadings(headings, [-1200, -200, 700, 1700, 2700]);
    await waitFor(() => {
      expect(currentLinks(links)).toEqual(['Conceptos clave']);
    });

    placeHeadings(headings, [-2400, -1400, -400, 60, 1500]);
    await waitFor(() => {
      expect(currentLinks(links)).toEqual(['Cómo elegir']);
    });
  });

  it('marks the last section once the page is scrolled to the bottom', async () => {
    const { links, headings } = await renderSqsPage();
    vi.spyOn(document.documentElement, 'scrollHeight', 'get').mockReturnValue(5000);
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(5000 - window.innerHeight);
    placeHeadings(headings, [-3000, -2000, -1000, -100, 300]);
    await waitFor(() => {
      expect(currentLinks(links)).toEqual(['Fuentes oficiales']);
    });
  });

  it('marks a section as soon as its link is clicked and keeps the in-page href', async () => {
    const { links } = await renderSqsPage();
    const target = links[2];
    if (!target) throw new Error('Expected a third table of contents link');
    fireEvent.click(target);
    expect(currentLinks(links)).toEqual(['Cómo se conecta con otros servicios']);
    expect(target).toHaveAttribute('href', '#como-se-conecta-con-otros-servicios');
  });
});
