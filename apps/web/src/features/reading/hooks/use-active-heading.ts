import { useEffect, useState } from 'react';

// A heading becomes active once its top passes this line, a little below the viewport top
// so a heading reached through its anchor (scroll-margin-top: 24px) already counts.
const ACTIVATION_OFFSET = 96;

const isScrolledToBottom = (): boolean => {
  const { scrollHeight } = document.documentElement;
  return (
    scrollHeight > window.innerHeight && window.innerHeight + window.scrollY >= scrollHeight - 2
  );
};

const findActiveId = (ids: readonly string[]): string | undefined => {
  if (ids.length > 0 && isScrolledToBottom()) return ids.at(-1);
  let active: string | undefined;
  for (const id of ids) {
    const heading = document.getElementById(id);
    if (!heading || heading.getBoundingClientRect().top > ACTIVATION_OFFSET) break;
    active = id;
  }
  return active;
};

/**
 * Tracks which section heading the reader is in: the last one whose top has scrolled past
 * the activation line, or the last heading once the page is scrolled to the bottom.
 */
export const useActiveHeading = (ids: readonly string[]) => {
  const [activeId, setActiveId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let frame: number | undefined;
    const update = () => {
      frame = undefined;
      setActiveId(findActiveId(ids));
    };
    const scheduleUpdate = () => {
      frame ??= window.requestAnimationFrame(update);
    };
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [ids]);

  return [activeId, setActiveId] as const;
};
