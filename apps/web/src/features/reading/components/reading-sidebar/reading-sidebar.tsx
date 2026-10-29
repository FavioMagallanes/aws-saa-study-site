import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { cx } from '../../../../shared/lib/class-names';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import type { SidebarGroup } from '../../model/reading-context';
import styles from './reading-sidebar.module.css';

interface ReadingSidebarProps {
  readonly heading: string;
  readonly groups: readonly SidebarGroup[];
}

export const ReadingSidebar = ({ heading, groups }: ReadingSidebarProps) => (
  <nav className={styles['reading-sidebar']} aria-label="Páginas relacionadas">
    <p className={styles['reading-sidebar__heading']}>{heading}</p>
    {groups.map((group) => (
      <div key={group.label ?? heading}>
        {group.label ? (
          <p
            className={cx(
              styles['reading-sidebar__group-label'],
              group.pages.length > 0 && styles['reading-sidebar__group-label--current'],
            )}
          >
            {group.label}
          </p>
        ) : null}
        {group.pages.length > 0 ? (
          <ul className={styles['reading-sidebar__pages']}>
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
        ) : null}
      </div>
    ))}
  </nav>
);
