import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { fakeAuth } from '../../../../app/tests/fake-auth-client';
import { renderApp } from '../../../../app/tests/render-app';
import { loadPages } from '../../../content/data/load-pages';
import reviewDigest from '../../data/review-digest.json';

const pages = loadPages();
const s3 = pages.find((page) => page.id === 'amazon-s3');
const s3Digest = reviewDigest['amazon-s3'];
const readAt = '2026-10-29T10:00:00.000Z';

describe('Repaso page with the real content', () => {
  it('summarizes only the pages the reader has already read', async () => {
    if (!s3) throw new Error('amazon-s3 page missing');
    await renderApp('/repaso', [{ pageId: 'amazon-s3', readAt }]);

    expect(await screen.findByRole('heading', { level: 1, name: 'Repaso' })).toBeInTheDocument();
    const card = (await screen.findByRole('heading', { level: 3, name: s3.title })).closest(
      'article',
    );
    if (!card) throw new Error('Review card not found');
    expect(within(card).getByText(s3Digest.intro)).toBeInTheDocument();
    const [firstConcept] = s3Digest.concepts;
    if (!firstConcept) throw new Error('amazon-s3 has no concepts');
    expect(within(card).getByText(firstConcept.term)).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: `Volver a leer ${s3.title}` })).toHaveAttribute(
      'href',
      '/lectura/amazon-s3',
    );
    expect(screen.queryByRole('heading', { level: 3, name: 'Amazon EC2' })).not.toBeInTheDocument();
  });

  it('invites the reader to read something first when nothing is read yet', async () => {
    await renderApp('/repaso', []);
    expect(
      await screen.findByText(
        'Aún no hay nada que repasar. Marca una página como leída y aparecerá aquí.',
      ),
    ).toBeInTheDocument();
  });

  it('asks signed-out visitors to sign in instead of showing an empty review', async () => {
    fakeAuth.session = null;
    await renderApp('/repaso', []);
    const link = await screen.findByRole('link', { name: 'Inicia sesión para ver tu repaso' });
    await waitFor(() => {
      expect(link).toHaveAttribute('href', expect.stringContaining('/acceso'));
    });
  });

  it('offers Repaso in the main navigation', async () => {
    await renderApp('/', []);
    const [nav] = screen.getAllByRole('navigation', { name: 'Principal' });
    if (!nav) throw new Error('Main navigation not found');
    expect(within(nav).getByRole('link', { name: 'Repaso' })).toHaveAttribute('href', '/repaso');
  });
});
