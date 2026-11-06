import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fakeAuth } from '../../../../app/tests/fake-auth-client';
import { renderApp } from '../../../../app/tests/render-app';
import { loadPages } from '../../../content/data/load-pages';
import reviewDigest from '../../../review/data/review-digest.json';

const pages = loadPages();
const titleOf = (pageId: string) => {
  const page = pages.find((candidate) => candidate.id === pageId);
  if (!page) throw new Error(`${pageId} page missing`);
  return page.title;
};
const readAt = '2026-10-29T10:00:00.000Z';
const LEAD =
  'Las páginas completas que ya marcaste como leídas, para volver a leerlas cuando quieras. Si buscas un resumen, usa Repaso.';

describe('Leídas page with the real content', () => {
  it('lists every read page grouped like Repaso, linking each title to its full page', async () => {
    const fundamental = pages.find((page) => page.kind === 'fundamental');
    const topic = pages.find((page) => page.kind === 'topic');
    if (!fundamental || !topic) throw new Error('Content kinds missing');
    await renderApp('/leidas', [
      { pageId: 'amazon-s3', readAt },
      { pageId: topic.id, readAt },
      { pageId: fundamental.id, readAt },
    ]);

    expect(await screen.findByRole('heading', { level: 1, name: 'Leídas' })).toBeInTheDocument();
    expect(screen.getByText(/^Las páginas completas que ya marcaste/)).toHaveTextContent(LEAD);
    const main = screen.getByRole('main');
    expect(within(main).getByRole('link', { name: 'Repaso' })).toHaveAttribute('href', '/repaso');
    await waitFor(() => {
      expect(
        within(main)
          .getAllByRole('heading', { level: 2 })
          .map((heading) => heading.textContent),
      ).toEqual(['Fundamentos', 'Arquitecturas', 'Servicios']);
    });
    for (const page of [fundamental, topic]) {
      expect(within(main).getByRole('link', { name: page.title })).toHaveAttribute(
        'href',
        `/lectura/${page.id}`,
      );
    }
    const services = screen.getByRole('region', { name: 'Servicios' });
    expect(within(services).getByRole('link', { name: titleOf('amazon-s3') })).toHaveAttribute(
      'href',
      '/lectura/amazon-s3',
    );
    expect(within(main).queryByText(reviewDigest['amazon-s3'].intro)).not.toBeInTheDocument();
    expect(within(main).queryByRole('link', { name: titleOf('amazon-ec2') })).toBeNull();
  });

  it('shows only the groups that have read pages', async () => {
    await renderApp('/leidas', [{ pageId: 'amazon-ec2', readAt }]);
    const main = await screen.findByRole('main');
    expect(await within(main).findByRole('link', { name: titleOf('amazon-ec2') })).toHaveAttribute(
      'href',
      '/lectura/amazon-ec2',
    );
    expect(
      within(main)
        .getAllByRole('heading', { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(['Servicios']);
  });

  it('points to the route when nothing is read yet', async () => {
    await renderApp('/leidas', []);
    const message = await screen.findByText(/Aún no has marcado ninguna página como leída\./);
    expect(within(message).getByRole('link', { name: 'Ruta' })).toHaveAttribute('href', '/');
  });

  it('asks signed-out visitors to sign in and come back to Leídas', async () => {
    fakeAuth.session = null;
    await renderApp('/leidas', []);
    const link = await screen.findByRole('link', {
      name: 'Inicia sesión para ver tus páginas leídas',
    });
    await waitFor(() => {
      expect(link).toHaveAttribute('href', expect.stringContaining('/acceso'));
    });
    expect(link).toHaveAttribute('href', expect.stringContaining('returnTo=%2Fleidas'));
  });

  it('says it is loading while the progress request is pending', async () => {
    await renderApp('/leidas', [], () => new Promise<Response>(() => undefined));
    expect(await screen.findByText('Cargando tu progreso…')).toBeInTheDocument();
  });

  it('explains the failure when the progress cannot be loaded', async () => {
    await renderApp('/leidas', 'unavailable');
    expect(
      await screen.findByText(
        'No se pudo cargar tu progreso, así que todavía no podemos mostrar tus páginas leídas.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });

  it('offers Leídas right after Repaso in the main navigation', async () => {
    await renderApp('/', []);
    const [nav] = screen.getAllByRole('navigation', { name: 'Principal' });
    if (!nav) throw new Error('Main navigation not found');
    const labels = within(nav)
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(labels.indexOf('Leídas')).toBe(labels.indexOf('Repaso') + 1);
    expect(within(nav).getByRole('link', { name: 'Leídas' })).toHaveAttribute('href', '/leidas');
  });
});
