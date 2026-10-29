export interface PendingKey {
  readonly key: string;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly altKey: boolean;
}

// Applies a key typed before the search input exists; undefined means the key is not text input.
export const applyPendingKey = (query: string, event: PendingKey): string | undefined => {
  if (event.ctrlKey || event.metaKey || event.altKey) return undefined;
  if (event.key === 'Backspace') return query.slice(0, -1);
  // Text keys report one character; named keys ("Shift", "ArrowDown", "Dead") report a word.
  return /^.$/u.test(event.key) ? query + event.key : undefined;
};
