// Starts a load once the browser is idle and returns a cancel function. A failed load is ignored:
// whatever needs the module requests it again later.
export const scheduleIdlePreload = (load: () => Promise<unknown>): (() => void) => {
  const run = () => {
    load().catch(() => undefined);
  };
  // Not every browser implements requestIdleCallback (and jsdom does not).
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run);
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const handle = window.setTimeout(run, 0);
  return () => {
    window.clearTimeout(handle);
  };
};
