import { beforeEach, describe, expect, it } from 'vitest';
import { WRITE_KEY_STORAGE_KEY, useWriteKeyStore } from '../../store/use-write-key-store';

beforeEach(() => {
  localStorage.clear();
  useWriteKeyStore.setState({ writeKey: undefined });
});

describe('write key store', () => {
  it('trims the key and persists it in this browser', () => {
    useWriteKeyStore.getState().setWriteKey('  secret-key-1234567890  ');
    expect(useWriteKeyStore.getState().writeKey).toBe('secret-key-1234567890');
    expect(localStorage.getItem(WRITE_KEY_STORAGE_KEY)).toContain('secret-key-1234567890');
  });

  it('forgets the key when cleared', () => {
    useWriteKeyStore.getState().setWriteKey('secret-key-1234567890');
    useWriteKeyStore.getState().clearWriteKey();
    expect(useWriteKeyStore.getState().writeKey).toBeUndefined();
  });
});
