import { Search } from 'lucide-react';
import { useId, useState } from 'react';
import type { GlossaryEntry } from '@arquitecto/contracts/glossary';
import { cx } from '../../../shared/lib/class-names';
import { ALPHABET, filterGlossary, groupByLetter } from '../model/glossary';
import { GlossaryEntryRow } from './glossary-entry-row/glossary-entry-row';
import styles from './glossary-screen.module.css';

interface GlossaryScreenProps {
  readonly entries: readonly GlossaryEntry[];
  readonly pageTitles: ReadonlyMap<string, string>;
}

export const GlossaryScreen = ({ entries, pageTitles }: GlossaryScreenProps) => {
  const [query, setQuery] = useState('');
  const inputId = useId();
  const groups = groupByLetter(filterGlossary(entries, query));
  const availableLetters = new Set(groupByLetter(entries).map((group) => group.letter));

  return (
    <main className={styles.glossary}>
      <header className={styles.glossary__header}>
        <p className={styles.glossary__eyebrow}>Glosario</p>
        <h1 className={styles.glossary__title}>Siglas y abreviaturas</h1>
        <p className={styles.glossary__lead}>
          El examen usa nombres abreviados y da por conocidas muchas siglas. Aquí está cada una con
          su nombre completo, qué significa en una frase y dónde aparece en esta guía.
        </p>
      </header>

      <div className={styles.glossary__filters}>
        <label className={styles.glossary__search} htmlFor={inputId}>
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <input
            id={inputId}
            className={styles['glossary__search-input']}
            type="search"
            value={query}
            placeholder="Filtrar siglas: EC2, RPO, SCP…"
            aria-label="Filtrar siglas"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        </label>
        <ul className={styles.glossary__letters} aria-label="Ir a la letra">
          {ALPHABET.map((letter) => (
            <li key={letter}>
              {availableLetters.has(letter) ? (
                <a className={styles.glossary__letter} href={`#letra-${letter}`}>
                  {letter}
                </a>
              ) : (
                <span
                  className={cx(styles.glossary__letter, styles['glossary__letter--disabled'])}
                  aria-hidden="true"
                >
                  {letter}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.glossary__groups} aria-live="polite">
        {groups.length === 0 ? (
          <p className={styles.glossary__empty}>No hay siglas que coincidan con «{query}».</p>
        ) : (
          groups.map((group) => (
            <section key={group.letter} aria-labelledby={`letra-${group.letter}`}>
              <h2 id={`letra-${group.letter}`} className={styles['glossary__group-letter']}>
                {group.letter}
              </h2>
              {group.entries.map((entry) => (
                <GlossaryEntryRow key={entry.id} entry={entry} pageTitles={pageTitles} />
              ))}
            </section>
          ))
        )}
      </div>
    </main>
  );
};
