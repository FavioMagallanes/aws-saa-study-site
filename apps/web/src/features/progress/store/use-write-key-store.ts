import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WriteKeyState {
  readonly writeKey: string | undefined;
  readonly setWriteKey: (writeKey: string) => void;
  readonly clearWriteKey: () => void;
}

export const WRITE_KEY_STORAGE_KEY = 'arquitecto-write-key';

export const useWriteKeyStore = create<WriteKeyState>()(
  persist(
    (set) => ({
      writeKey: undefined,
      setWriteKey: (writeKey) => {
        set({ writeKey: writeKey.trim() });
      },
      clearWriteKey: () => {
        set({ writeKey: undefined });
      },
    }),
    { name: WRITE_KEY_STORAGE_KEY },
  ),
);
