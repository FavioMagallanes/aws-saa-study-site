import { Link } from '@tanstack/react-router';
import { Check, ChevronRight } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { cx } from '../../../../shared/lib/class-names';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import type { SidebarGroup, SidebarSection } from '../../model/reading-context';
import styles from './reading-sidebar.module.css';

const readCountLabel = (read: number, total: number): string =>
  `${String(read)} de ${String(total)} ${total === 1 ? 'leída' : 'leídas'}`;

const SidebarGroupPages = ({ group }: { readonly group: SidebarGroup }) => {
  const labelId = useId();
  return (
    <div className={styles['reading-sidebar__group']}>
      {group.label ? (
        <p
          id={labelId}
          className={cx(
            styles['reading-sidebar__group-label'],
            group.current && styles['reading-sidebar__group-label--current'],
          )}
        >
          {group.label}
        </p>
      ) : null}
      <ul
        className={styles['reading-sidebar__pages']}
        aria-labelledby={group.label ? labelId : undefined}
      >
        {group.pages.map((page) => (
          <li key={page.id}>
            <Link
              to="/lectura/$pageId"
              params={{ pageId: page.id }}
              className={styles['reading-sidebar__link']}
              aria-current={page.current ? 'page' : undefined}
            >
              {page.title}
              {page.read ? (
                <span className={styles['reading-sidebar__read-icon']}>
                  <Check size={14} strokeWidth={1.75} aria-hidden="true" />
                  <VisuallyHidden>(leído)</VisuallyHidden>
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ReadingSidebarProps {
  readonly sections: readonly SidebarSection[];
}

// The parent remounts this per page so the section of the current page starts open again.
export const ReadingSidebar = ({ sections }: ReadingSidebarProps) => {
  const headingId = useId();
  const navRef = useRef<HTMLElement>(null);

  // Long sections (the 118 services) would leave the current page below the fold of the scrollable
  // sidebar, so bring it into view without moving the page itself.
  useEffect(() => {
    const nav = navRef.current;
    const container = nav?.parentElement;
    const current = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!container || !current) return;
    const offset = current.getBoundingClientRect().top - container.getBoundingClientRect().top;
    if (offset < 0 || offset > container.clientHeight - current.offsetHeight) {
      container.scrollTop += offset - container.clientHeight / 3;
    }
  }, []);

  return (
    <nav ref={navRef} className={styles['reading-sidebar']} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles['reading-sidebar__heading']}>
        Ruta de lectura
      </h2>
      <ol className={styles['reading-sidebar__sections']}>
        {sections.map((section) => (
          <li key={section.id}>
            <details className={styles['reading-sidebar__section']} open={section.open}>
              <summary className={styles['reading-sidebar__summary']}>
                <ChevronRight
                  className={styles['reading-sidebar__chevron']}
                  size={14}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className={styles['reading-sidebar__summary-text']}>
                  <span
                    className={cx(
                      styles['reading-sidebar__section-title'],
                      section.open && styles['reading-sidebar__section-title--current'],
                    )}
                  >
                    {section.title}
                  </span>
                  <span className={styles['reading-sidebar__section-count']}>
                    {readCountLabel(section.read, section.total)}
                  </span>
                </span>
              </summary>
              {section.groups.map((group) => (
                <SidebarGroupPages key={group.id} group={group} />
              ))}
            </details>
          </li>
        ))}
      </ol>
    </nav>
  );
};
