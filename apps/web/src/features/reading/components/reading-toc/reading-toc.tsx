import { useEffect, useState, type RefObject } from 'react';
import styles from './reading-toc.module.css';

interface TocItem {
  readonly id: string;
  readonly text: string;
}

interface ReadingTocProps {
  readonly articleRef: RefObject<HTMLElement | null>;
  readonly pageId: string;
}

export const ReadingToc = ({ articleRef, pageId }: ReadingTocProps) => {
  const [items, setItems] = useState<readonly TocItem[]>([]);

  useEffect(() => {
    const headings = articleRef.current?.querySelectorAll<HTMLHeadingElement>('h2[id]') ?? [];
    setItems([...headings].map((heading) => ({ id: heading.id, text: heading.textContent })));
  }, [articleRef, pageId]);

  if (items.length === 0) return null;

  return (
    <nav className={styles['reading-toc']} aria-label="En esta página">
      <p className={styles['reading-toc__heading']}>En esta página</p>
      <ul className={styles['reading-toc__list']}>
        {items.map((item) => (
          <li key={item.id}>
            <a className={styles['reading-toc__link']} href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
