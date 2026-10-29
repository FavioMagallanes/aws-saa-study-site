import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../../../app/tests/render-app';

const renderMap = () => renderApp('/mapa-del-examen');

describe('Mapa del examen with the real content', () => {
  it('opens the first domain and keeps the others collapsed', async () => {
    await renderMap();
    const toggles = screen.getAllByRole('button', { name: /^Dominio \d · / });
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'true',
      'false',
      'false',
      'false',
    ]);
  });

  it('lists the tasks of the open domain with links to their pages', async () => {
    await renderMap();
    const panel = document.getElementById('domain-1-tasks');
    if (!panel) throw new Error('Domain 1 panel not found');
    expect(within(panel).getAllByRole('heading', { level: 4 })).toHaveLength(3);
    expect(within(panel).getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('switches the open domain from the summary cards', async () => {
    await renderMap();
    const summary = screen.getByRole('list', { name: 'Resumen por dominio' });
    fireEvent.click(within(summary).getByRole('button', { name: /Dominio 3/ }));
    const toggle = screen.getByRole('button', { name: /^Dominio 3 · / });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /^Dominio 1 · / })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('collapses the open domain when its heading is toggled again', async () => {
    await renderMap();
    fireEvent.click(screen.getByRole('button', { name: /^Dominio 1 · / }));
    expect(screen.getByRole('button', { name: /^Dominio 1 · / })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
