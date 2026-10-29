import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../render-app';

const DIALOG_NAME = 'Buscar en el sitio';

const openWithShortcut = async (modifier: 'ctrlKey' | 'metaKey' = 'ctrlKey') => {
  fireEvent.keyDown(window, { key: 'k', [modifier]: true });
  return screen.findByRole('dialog', { name: DIALOG_NAME });
};

const typeQuery = (value: string) => {
  fireEvent.change(screen.getByRole('combobox', { name: 'Buscar páginas' }), {
    target: { value },
  });
};

describe('search dialog', () => {
  it('opens with Ctrl+K, focuses the query and shows the empty-query state', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut('ctrlKey');
    const input = within(dialog).getByRole('combobox', { name: 'Buscar páginas' });
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(
      within(dialog).getByText('Escribe el nombre de un servicio, un concepto o una sigla.'),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens with Cmd+K', async () => {
    await renderApp('/');
    expect(await openWithShortcut('metaKey')).toBeInTheDocument();
  });

  it('opens from the top bar trigger and returns focus to it when Escape closes', async () => {
    await renderApp('/');
    const trigger = screen.getByRole('button', { name: 'Buscar servicio, concepto o sigla' });
    expect(trigger).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K');
    trigger.focus();
    fireEvent.click(trigger);
    await screen.findByRole('dialog', { name: DIALOG_NAME });
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Buscar páginas' }), {
      key: 'Escape',
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });

  it('opens from the mobile search button', async () => {
    await renderApp('/');
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('dialog', { name: DIALOG_NAME })).toBeInTheDocument();
  });

  it('lists real results and announces how many there are', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    typeQuery('Amazon S3');
    const options = within(dialog).getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      `${String(options.length)} resultados`,
    );
    expect(within(dialog).getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    const selected = within(dialog).getByRole('option', { selected: true });
    expect(selected).toHaveAccessibleName('Amazon S3');
    expect(selected).toHaveAccessibleDescription(
      /^Almacenamiento\s+Amazon S3 \(Simple Storage Service\)/,
    );
  });

  it('shows the no-results state and announces it', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    typeQuery('zxqwvplk');
    expect(within(dialog).getByText('Sin resultados para «zxqwvplk».')).toBeInTheDocument();
    expect(within(dialog).getByRole('status')).toHaveTextContent('Sin resultados');
    expect(within(dialog).queryByRole('option')).not.toBeInTheDocument();
  });

  it('moves the active result with the arrow keys and wraps around', async () => {
    await renderApp('/');
    await openWithShortcut();
    typeQuery('Amazon S3');
    const input = screen.getByRole('combobox', { name: 'Buscar páginas' });
    const options = screen.getAllByRole('option');
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input).toHaveAttribute('aria-activedescendant', options[1]?.id);
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveAttribute('aria-activedescendant', options.at(-1)?.id);
  });

  it('opens the active result with Enter and closes the dialog', async () => {
    await renderApp('/');
    await openWithShortcut();
    typeQuery('Amazon S3');
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Buscar páginas' }), {
      key: 'Enter',
    });
    expect(await screen.findByRole('heading', { level: 1, name: 'Amazon S3' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
  });

  it('opens a result when it is clicked', async () => {
    await renderApp('/');
    await openWithShortcut();
    typeQuery('CDN');
    const [first] = screen.getAllByRole('option');
    if (!first) throw new Error('No search results');
    act(() => {
      fireEvent.click(first);
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Amazon CloudFront' }),
    ).toBeInTheDocument();
  });

  it('keeps Tab focus inside the dialog', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    const input = within(dialog).getByRole('combobox', { name: 'Buscar páginas' });
    const close = within(dialog).getByRole('button', { name: 'Cerrar búsqueda' });

    close.focus();
    fireEvent.keyDown(close, { key: 'Tab' });
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(close).toHaveFocus();
  });

  it('closes with the close button', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cerrar búsqueda' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
    });
  });
});
