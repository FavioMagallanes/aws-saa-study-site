import { ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useState, type RefObject } from 'react';
import { cx } from '../../../../shared/lib/class-names';
import { useActiveHeading } from '../../hooks/use-active-heading';
import styles from './reading-toc.module.css';

interface TocItem {
  readonly id: string;
  readonly text: string;
}

interface ReadingTocProps {
  readonly articleRef: RefObject<HTMLElement | null>;
  readonly pageId: string;
  /** Below the wide layout the list sits in the article column behind a disclosure toggle. */
  readonly collapsible?: boolean;
}

const HEADING = 'En esta página';

export const ReadingToc = ({ articleRef, pageId, collapsible = false }: ReadingTocProps) => {
  const [items, setItems] = useState<readonly TocItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const [activeId, setActiveId] = useActiveHeading(ids);
  const listId = useId();

  useEffect(() => {
    const headings = articleRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id]') ?? [];
    setItems([...headings].map((heading) => ({ id: heading.id, text: heading.textContent })));
  }, [articleRef, pageId]);

  if (items.length === 0) return null;

  return (
    <nav
      className={cx(styles['reading-toc'], collapsible && styles['reading-toc--collapsible'])}
      aria-label={HEADING}
    >
      {collapsible ? (
        <button
          type="button"
          className={styles['reading-toc__toggle']}
          aria-expanded={expanded}
          aria-controls={listId}
          onClick={() => {
            setExpanded((open) => !open);
          }}
        >
          {HEADING}
          <ChevronDown
            className={cx(
              styles['reading-toc__chevron'],
              expanded && styles['reading-toc__chevron--open'],
            )}
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>
      ) : (
        <p className={styles['reading-toc__heading']}>{HEADING}</p>
      )}
      <ul id={listId} className={styles['reading-toc__list']} hidden={collapsible && !expanded}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              className={cx(
                styles['reading-toc__link'],
                item.id === activeId && styles['reading-toc__link--active'],
              )}
              href={`#${item.id}`}
              aria-current={item.id === activeId ? 'location' : undefined}
              onClick={() => {
                setActiveId(item.id);
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
