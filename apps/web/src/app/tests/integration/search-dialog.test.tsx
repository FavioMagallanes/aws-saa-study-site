import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../render-app';

const DIALOG_NAME = 'Buscar en el sitio';

const openWithShortcut = async (modifier: 'ctrlKey' | 'metaKey' = 'ctrlKey') => {
  fireEvent.keyDown(window, { key: 'k', [modifier]: true });
  return screen.findByRole('dialog', { name: DIALOG_NAME });
};

const queryInput = () => screen.getByRole('combobox', { name: 'Buscar páginas' });

const typeQuery = (value: string) => {
  fireEvent.change(queryInput(), { target: { value } });
};

const pressKey = (key: string) => {
  fireEvent.keyDown(queryInput(), { key });
};

const optionsIn = (groupName: string) =>
  within(screen.getByRole('group', { name: groupName })).getAllByRole('option');

// Moves the active row down until it is the given option.
const activate = (option: HTMLElement) => {
  const options = screen.getAllByRole('option');
  const index = options.indexOf(option);
  for (let step = 0; step < index; step += 1) pressKey('ArrowDown');
  expect(queryInput()).toHaveAttribute('aria-activedescendant', option.id);
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
    pressKey('Escape');
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

  it('groups the results under Siglas, Páginas and En el texto, in that order', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    typeQuery('S3');
    const listbox = within(dialog).getByRole('listbox', { name: 'Resultados' });
    const groups = within(listbox).getAllByRole('group');
    expect(groups).toHaveLength(3);
    expect(groups[0]).toHaveAccessibleName('Siglas');
    expect(groups[1]).toHaveAccessibleName('Páginas');
    expect(groups[2]).toHaveAccessibleName('En el texto');
    const [sigla] = optionsIn('Siglas');
    expect(sigla).toHaveAccessibleName('S3');
    expect(sigla).toHaveAccessibleDescription('Amazon Simple Storage Service');
    expect(
      within(groups[2] ?? dialog).getByRole('option', {
        name: 'Amazon S3 Glacier › Las tres clases S3 Glacier',
      }),
    ).toHaveAccessibleDescription('Almacenamiento');
  });

  it('does not render empty groups', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    typeQuery('Amazon CloudFront');
    expect(within(dialog).queryByRole('group', { name: 'Siglas' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: 'Páginas' })).toBeInTheDocument();
  });

  it('lists real results and announces how many there are across groups', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    typeQuery('Amazon S3');
    const options = within(dialog).getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
    expect(within(dialog).getByRole('status')).toHaveTextContent(
      `${String(options.length)} resultados`,
    );
    expect(within(dialog).getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByRole('option', { selected: true })).toBe(options[0]);
    const [page] = optionsIn('Páginas');
    expect(page).toHaveAccessibleName('Amazon S3');
    expect(page).toHaveAccessibleDescription(
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

  it('moves the active result across groups in visual order and wraps around', async () => {
    await renderApp('/');
    await openWithShortcut();
    typeQuery('S3');
    const input = queryInput();
    const options = screen.getAllByRole('option');
    const [lastSigla] = optionsIn('Siglas').slice(-1);
    const [firstPage] = optionsIn('Páginas');
    const [firstHeading] = optionsIn('En el texto');
    const lastPage = optionsIn('Páginas').at(-1);
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);

    for (const option of options.slice(1)) {
      pressKey('ArrowDown');
      expect(input).toHaveAttribute('aria-activedescendant', option.id);
      expect(option).toHaveAttribute('aria-selected', 'true');
    }
    expect(options.indexOf(firstPage ?? input)).toBe(options.indexOf(lastSigla ?? input) + 1);
    expect(options.indexOf(firstHeading ?? input)).toBe(options.indexOf(lastPage ?? input) + 1);

    pressKey('ArrowDown');
    expect(input).toHaveAttribute('aria-activedescendant', options[0]?.id);
    expect(screen.getAllByRole('option', { selected: true })).toHaveLength(1);

    pressKey('ArrowUp');
    expect(input).toHaveAttribute('aria-activedescendant', options.at(-1)?.id);
  });

  it('opens a page result with Enter and closes the dialog', async () => {
    const { router } = await renderApp('/');
    await openWithShortcut();
    typeQuery('Amazon CloudFront');
    expect(screen.getByRole('option', { selected: true })).toHaveAccessibleName(
      'Amazon CloudFront',
    );
    pressKey('Enter');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Amazon CloudFront' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/lectura/amazon-cloudfront');
    expect(router.state.location.hash).toBe('');
    expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
  });

  it('opens an abbreviation in the glossary at its entry', async () => {
    const { router } = await renderApp('/');
    await openWithShortcut();
    typeQuery('S3');
    const [sigla] = optionsIn('Siglas');
    if (!sigla) throw new Error('No abbreviation results');
    activate(sigla);
    pressKey('Enter');
    expect(await screen.findByRole('heading', { level: 3, name: 'S3' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/glosario');
    expect(router.state.location.hash).toBe('s3');
    expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
  });

  it('opens a heading result in its page at the heading', async () => {
    const { router } = await renderApp('/');
    await openWithShortcut();
    typeQuery('pago a cargo del solicitante');
    const heading = within(screen.getByRole('group', { name: 'En el texto' })).getByRole('option', {
      name: 'Amazon S3 › Buckets con pago a cargo del solicitante (Requester Pays)',
    });
    activate(heading);
    pressKey('Enter');
    expect(await screen.findByRole('heading', { level: 1, name: 'Amazon S3' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/lectura/amazon-s3');
    expect(router.state.location.hash).toBe(
      'buckets-con-pago-a-cargo-del-solicitante-requester-pays',
    );
  });

  it('opens a result when it is clicked', async () => {
    await renderApp('/');
    await openWithShortcut();
    typeQuery('CDN');
    const [first] = optionsIn('Páginas');
    if (!first) throw new Error('No search results');
    act(() => {
      fireEvent.click(first);
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Amazon CloudFront' }),
    ).toBeInTheDocument();
  });

  it('shows the keyboard hints and what the search covers', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    expect(within(dialog).getByText('Busca en servicios, siglas y texto')).toBeInTheDocument();
    expect(within(dialog).getByText('navegar')).toBeInTheDocument();
    expect(within(dialog).getByText('abrir')).toBeInTheDocument();
    expect(within(dialog).getByText('cerrar')).toBeInTheDocument();
  });

  it('keeps Tab focus inside the dialog', async () => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    const input = within(dialog).getByRole('combobox', { name: 'Buscar páginas' });
    const cancel = within(dialog).getByRole('button', { name: 'Cancelar' });

    cancel.focus();
    fireEvent.keyDown(cancel, { key: 'Tab' });
    expect(input).toHaveFocus();

    fireEvent.keyDown(input, { key: 'Tab', shiftKey: true });
    expect(cancel).toHaveFocus();
  });

  it.each(['Cerrar búsqueda (esc)', 'Cancelar'])('closes with the "%s" button', async (name) => {
    await renderApp('/');
    const dialog = await openWithShortcut();
    fireEvent.click(within(dialog).getByRole('button', { name }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: DIALOG_NAME })).not.toBeInTheDocument();
    });
  });
});
