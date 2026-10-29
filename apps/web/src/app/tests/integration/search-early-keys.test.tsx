import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../render-app';

// Own file on purpose: the lazy dialog chunk has not loaded yet when the first test opens it.
describe('search dialog while its chunk loads', () => {
  it('keeps the keys typed right after Cmd+K and searches them', async () => {
    await renderApp('/');
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.queryByRole('dialog', { name: 'Buscar en el sitio' })).not.toBeInTheDocument();
    for (const key of ['s', 'e', 'Backspace', '3']) fireEvent.keyDown(document.body, { key });

    const dialog = await screen.findByRole('dialog', { name: 'Buscar en el sitio' });
    const input = within(dialog).getByRole('combobox', { name: 'Buscar páginas' });
    expect(input).toHaveValue('s3');
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(within(dialog).getByRole('group', { name: 'Siglas' })).toBeInTheDocument();
  });

  it('starts empty the next time it opens', async () => {
    await renderApp('/');
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const dialog = await screen.findByRole('dialog', { name: 'Buscar en el sitio' });
    expect(within(dialog).getByRole('combobox', { name: 'Buscar páginas' })).toHaveValue('');
  });
});
