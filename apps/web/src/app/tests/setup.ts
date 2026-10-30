import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { resetFakeAuth } from './fake-auth-client';

// The Neon Auth SDK is the only faked boundary: every test starts signed in as TEST_SESSION.
vi.mock('../../features/auth/data/auth-client', async () => {
  const { fakeAuthClient } = await import('./fake-auth-client');
  return fakeAuthClient;
});

afterEach(() => {
  cleanup();
  resetFakeAuth();
});

// jsdom does not implement the modal dialog methods; emulate the parts the UI relies on.
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}

// jsdom does not implement matchMedia; report "no preference" so themes default to light.
vi.stubGlobal('matchMedia', (query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => undefined,
  removeEventListener: () => undefined,
}));

// jsdom does not implement scrolling; keeping an element in view is a no-op in tests.
if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = () => undefined;
}
