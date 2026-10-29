import { afterEach, describe, expect, it, vi } from 'vitest';
import { scheduleIdlePreload } from '../../model/idle-preload';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('scheduleIdlePreload', () => {
  it('loads when the browser reports it is idle, not before', () => {
    let idleTask: (() => void) | undefined;
    vi.stubGlobal('requestIdleCallback', (task: () => void) => {
      idleTask = task;
      return 7;
    });
    vi.stubGlobal('cancelIdleCallback', vi.fn());
    const load = vi.fn(() => Promise.resolve());

    scheduleIdlePreload(load);
    expect(load).not.toHaveBeenCalled();
    idleTask?.();
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('does not load once cancelled', () => {
    const cancelIdleCallback = vi.fn();
    vi.stubGlobal('requestIdleCallback', () => 7);
    vi.stubGlobal('cancelIdleCallback', cancelIdleCallback);

    scheduleIdlePreload(() => Promise.resolve())();
    expect(cancelIdleCallback).toHaveBeenCalledWith(7);
  });

  it('falls back to a timer where requestIdleCallback is missing', () => {
    vi.useFakeTimers();
    vi.stubGlobal('requestIdleCallback', undefined);
    const load = vi.fn(() => Promise.resolve());

    const cancel = scheduleIdlePreload(load);
    expect(load).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(load).toHaveBeenCalledTimes(1);

    const cancelledLoad = vi.fn(() => Promise.resolve());
    scheduleIdlePreload(cancelledLoad)();
    vi.runAllTimers();
    expect(cancelledLoad).not.toHaveBeenCalled();
    cancel();
  });

  it('swallows a failed load so the app keeps working', async () => {
    vi.stubGlobal('requestIdleCallback', (task: () => void) => {
      task();
      return 1;
    });
    vi.stubGlobal('cancelIdleCallback', vi.fn());
    const failure = Promise.reject(new TypeError('Failed to fetch dynamically imported module'));
    const load = vi.fn(() => failure);

    expect(() => scheduleIdlePreload(load)).not.toThrow();
    expect(load).toHaveBeenCalledTimes(1);
    // An unhandled rejection would fail the run; let it surface before the test ends.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
