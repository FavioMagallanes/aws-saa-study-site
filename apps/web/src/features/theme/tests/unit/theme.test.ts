import { describe, expect, it } from 'vitest';
import { resolveInitialTheme, toggleTheme } from '../../model/theme';

describe('resolveInitialTheme', () => {
  it('prefers a valid stored theme over the system preference', () => {
    expect(resolveInitialTheme('light', true)).toBe('light');
    expect(resolveInitialTheme('dark', false)).toBe('dark');
  });

  it.each([null, undefined, 'sepia', 42])('falls back to the system preference for %j', (value) => {
    expect(resolveInitialTheme(value, true)).toBe('dark');
    expect(resolveInitialTheme(value, false)).toBe('light');
  });
});

describe('toggleTheme', () => {
  it('switches between light and dark', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});
