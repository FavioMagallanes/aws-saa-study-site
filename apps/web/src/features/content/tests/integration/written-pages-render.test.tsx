/// <reference types="node" />
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

const PAGES_DIR = join(import.meta.dirname, '../../../../../content/pages');

const writtenPageIds = readdirSync(PAGES_DIR, { recursive: true, encoding: 'utf8' })
  .filter((path) => path.endsWith('.mdx'))
  .filter((path) => !readFileSync(join(PAGES_DIR, path), 'utf8').includes('Contenido pendiente.'))
  .map((path) => basename(path, '.mdx'));

describe('written pages render', () => {
  it.each(writtenPageIds)('%s renders its title, sections and sources', async (pageId) => {
    await renderApp(`/lectura/${pageId}`);
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fuentes oficiales' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /se abre en una pestaña nueva/ }).length,
    ).toBeGreaterThan(0);
  });
});
