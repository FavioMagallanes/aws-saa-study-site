import { useEffect, useState } from 'react';
import { preloadSearchDialog } from '../components/lazy-search-dialog';
import { scheduleIdlePreload } from '../model/idle-preload';
import { applyPendingKey } from '../model/pending-query';

const isSearchShortcut = (event: KeyboardEvent): boolean =>
  event.key.toLowerCase() === 'k' &&
  (event.metaKey || event.ctrlKey) &&
  !event.altKey &&
  !event.shiftKey;

// Keys aimed at a text field or at the dialog itself are already handled there.
const isHandledTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.closest('dialog[open]') !== null);

// Owns whether the search dialog is open and opens it with Cmd+K / Ctrl+K anywhere on the page.
// While the dialog chunk loads, typed keys build `pendingQuery` so the dialog starts with them.
export const useSearchDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');

  useEffect(() => scheduleIdlePreload(preloadSearchDialog), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      setPendingQuery('');
      setIsOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || isHandledTarget(event.target)) return;
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (applyPendingKey('', event) === undefined) return;
      event.preventDefault();
      setPendingQuery((query) => applyPendingKey(query, event) ?? query);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    pendingQuery,
    open: () => {
      setPendingQuery('');
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
      setPendingQuery('');
    },
  };
};
