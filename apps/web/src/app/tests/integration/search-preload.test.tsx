import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../render-app';

afterEach(() => {
  // Unmount first: unmounting cancels the idle callback through the stubbed API.
  cleanup();
  vi.unstubAllGlobals();
});

describe('search dialog preload', () => {
  it('preloads the dialog when the browser is idle after the app mounts', async () => {
    const idleTasks: (() => void)[] = [];
    vi.stubGlobal('requestIdleCallback', (task: () => void) => idleTasks.push(task));
    vi.stubGlobal('cancelIdleCallback', vi.fn());
    await renderApp('/');
    expect(idleTasks).toHaveLength(1);

    for (const task of idleTasks) task();
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(await screen.findByRole('dialog', { name: 'Buscar en el sitio' })).toBeInTheDocument();
  });
});
