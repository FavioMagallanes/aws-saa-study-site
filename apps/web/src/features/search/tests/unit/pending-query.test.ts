import { describe, expect, it } from 'vitest';
import { applyPendingKey } from '../../model/pending-query';

const key = (
  value: string,
  modifiers: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey', boolean>> = {},
) => ({
  key: value,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  ...modifiers,
});

describe('applyPendingKey', () => {
  it('appends printable characters, including spaces and accents', () => {
    expect(applyPendingKey('', key('s'))).toBe('s');
    expect(applyPendingKey('s', key('3'))).toBe('s3');
    expect(applyPendingKey('ruta', key(' '))).toBe('ruta ');
    expect(applyPendingKey('regi', key('ó'))).toBe('regió');
  });

  it('removes the last character with Backspace', () => {
    expect(applyPendingKey('s3', key('Backspace'))).toBe('s');
    expect(applyPendingKey('', key('Backspace'))).toBe('');
  });

  it('ignores shortcuts and non-text keys', () => {
    expect(applyPendingKey('s', key('k', { metaKey: true }))).toBeUndefined();
    expect(applyPendingKey('s', key('c', { ctrlKey: true }))).toBeUndefined();
    expect(applyPendingKey('s', key('a', { altKey: true }))).toBeUndefined();
    expect(applyPendingKey('s', key('Shift'))).toBeUndefined();
    expect(applyPendingKey('s', key('ArrowDown'))).toBeUndefined();
    expect(applyPendingKey('s', key('Enter'))).toBeUndefined();
  });
});
