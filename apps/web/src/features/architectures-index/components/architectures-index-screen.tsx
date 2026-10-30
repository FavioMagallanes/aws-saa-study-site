import type { PageMeta } from '@arquitecto/contracts/content';
import { Link } from '@tanstack/react-router';
import { ProgressBar } from '../../../shared/ui/progress-bar/progress-bar';
import type { ExamGuide } from '../../content/model/exam-guide';
import type { ReadPageIds } from '../../content/model/page-progress';
import type { ProgressStatus } from '../../progress/hooks/use-reading-progress';
import { buildTopicDomains, formatTopicReadCount, topicPages } from '../model/topic-domains';
import { ReadMark } from './read-mark/read-mark';
import styles from './architectures-index-screen.module.css';

interface ArchitecturesIndexScreenProps {
  readonly pages: readonly PageMeta[];
  readonly guide: ExamGuide;
  readonly readPageIds: ReadPageIds;
  readonly progressStatus: ProgressStatus;
}

export const ArchitecturesIndexScreen = ({
  pages,
  guide,
  readPageIds,
  progressStatus,
}: ArchitecturesIndexScreenProps) => {
  const domains = buildTopicDomains(pages, guide, readPageIds);

  return (
    <main className={styles['architectures-index']}>
      <header className={styles['architectures-index__header']}>
        <p className={styles['architectures-index__eyebrow']}>Arquitecturas</p>
        <h1 className={styles['architectures-index__title']}>
          Los temas que conectan los servicios
        </h1>
        <p className={styles['architectures-index__lead']}>
          {`Los ${String(topicPages(pages).length)} temas transversales, ordenados por los cuatro dominios del examen. Cada uno explica qué problema resuelve y cuándo elegir una opción u otra.`}
        </p>
      </header>

      {domains.map((domain) => {
        const titleId = `architectures-domain-${String(domain.id)}`;
        return (
          <section
            key={domain.id}
            className={styles['architectures-index__domain']}
            aria-labelledby={titleId}
          >
            <p className={styles['architectures-index__eyebrow']}>Dominio {domain.id}</p>
            <div className={styles['architectures-index__domain-header']}>
              <h2 id={titleId} className={styles['architectures-index__domain-title']}>
                {domain.title}
              </h2>
              <p className={styles['architectures-index__weight']}>Peso {domain.weight} %</p>
            </div>
            <div className={styles['architectures-index__progress']}>
              <ProgressBar
                label={`Progreso de ${domain.title}`}
                percentage={domain.summary.percentage}
              />
              {progressStatus === 'ready' ? (
                <p className={styles['architectures-index__count']}>
                  {formatTopicReadCount(domain.summary.read, domain.summary.total)}
                </p>
              ) : null}
            </div>
            <ul className={styles['architectures-index__topics']}>
              {domain.topics.map((topic) => (
                <li key={topic.pageId} className={styles['architectures-index__topic']}>
                  <Link
                    to="/lectura/$pageId"
                    params={{ pageId: topic.pageId }}
                    className={styles['architectures-index__topic-link']}
                  >
                    {topic.title}
                  </Link>
                  {topic.read ? <ReadMark /> : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
};
