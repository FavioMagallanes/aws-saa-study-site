import { Link } from '@tanstack/react-router';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { Chip } from '../../../../shared/ui/chip/chip';
import styles from './glossary-entry-row.module.css';

interface GlossaryEntryRowProps {
  readonly entry: GlossaryEntry;
  readonly pageTitles: ReadonlyMap<string, string>;
}

export const GlossaryEntryRow = ({ entry, pageTitles }: GlossaryEntryRowProps) => (
  <article className={styles['glossary-entry']} id={entry.id}>
    <h3 className={styles['glossary-entry__abbreviation']}>{entry.abbreviation}</h3>
    <div className={styles['glossary-entry__details']}>
      <p className={styles['glossary-entry__name']}>{entry.fullName}</p>
      <p className={styles['glossary-entry__definition']}>{entry.definition}</p>
      <ul className={styles['glossary-entry__meta']}>
        {entry.pages.length > 0 ? (
          <>
            <li className={styles['glossary-entry__meta-label']}>Aparece en</li>
            {entry.pages.map((pageId) => (
              <li key={pageId}>
                <Link
                  to="/lectura/$pageId"
                  params={{ pageId }}
                  className={styles['glossary-entry__page-link']}
                >
                  <Chip>{pageTitles.get(pageId) ?? pageId}</Chip>
                </Link>
              </li>
            ))}
          </>
        ) : null}
        <li>
          <a
            className={styles['glossary-entry__source']}
            href={entry.source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fuente: {entry.source.title}
          </a>
        </li>
      </ul>
    </div>
  </article>
);
