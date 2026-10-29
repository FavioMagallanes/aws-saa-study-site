import type { PageMeta } from '@arquitecto/contracts/content';
import { useState } from 'react';
import type { ExamGuide } from '../../content/model/exam-guide';
import type { ReadPageIds } from '../../content/model/page-progress';
import { buildExamMap } from '../model/exam-map';
import { DomainCard } from './domain-card/domain-card';
import { DomainSection } from './domain-section/domain-section';
import styles from './exam-map-screen.module.css';

interface ExamMapScreenProps {
  readonly pages: readonly PageMeta[];
  readonly guide: ExamGuide;
  readonly readPageIds: ReadPageIds;
}

export const ExamMapScreen = ({ pages, guide, readPageIds }: ExamMapScreenProps) => {
  const domains = buildExamMap(pages, guide, readPageIds);
  const [openDomainId, setOpenDomainId] = useState<number | undefined>(domains[0]?.id);

  return (
    <main className={styles['exam-map']}>
      <header className={styles['exam-map__header']}>
        <p className={styles['exam-map__eyebrow']}>Mapa del examen</p>
        <h1 className={styles['exam-map__title']}>Qué pide la guía y dónde lo lees</h1>
        <p className={styles['exam-map__lead']}>
          Cada tarea de la guía oficial SAA-C03, con las páginas de este sitio que la cubren. Así
          ves de un vistazo qué ya leíste y qué te falta.
        </p>
      </header>

      <ul className={styles['exam-map__summary']} aria-label="Resumen por dominio">
        {domains.map((domain) => (
          <li key={domain.id}>
            <DomainCard
              domain={domain}
              active={domain.id === openDomainId}
              onSelect={() => {
                setOpenDomainId(domain.id);
              }}
            />
          </li>
        ))}
      </ul>

      <ul className={styles['exam-map__details']}>
        {domains.map((domain) => (
          <DomainSection
            key={domain.id}
            domain={domain}
            open={domain.id === openDomainId}
            onToggle={() => {
              setOpenDomainId(domain.id === openDomainId ? undefined : domain.id);
            }}
          />
        ))}
      </ul>
    </main>
  );
};
