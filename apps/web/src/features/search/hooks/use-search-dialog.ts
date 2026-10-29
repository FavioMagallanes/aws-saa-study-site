import { useEffect, useState } from 'react';

const isSearchShortcut = (event: KeyboardEvent): boolean =>
  event.key.toLowerCase() === 'k' &&
  (event.metaKey || event.ctrlKey) &&
  !event.altKey &&
  !event.shiftKey;

// Owns whether the search dialog is open and opens it with Cmd+K / Ctrl+K anywhere on the page.
export const useSearchDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isSearchShortcut(event)) return;
      event.preventDefault();
      setIsOpen(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    isOpen,
    open: () => {
      setIsOpen(true);
    },
    close: () => {
      setIsOpen(false);
    },
  };
};
