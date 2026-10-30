import { Link } from '@tanstack/react-router';
import { cx } from '../../../../shared/lib/class-names';
import { Chip } from '../../../../shared/ui/chip/chip';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import styles from './guided-route.module.css';

export type ChapterStatus =
  | { readonly kind: 'label'; readonly text: string }
  | { readonly kind: 'count'; readonly read: number; readonly total: number }
  | { readonly kind: 'read' };

export interface GuidedChapter {
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly status: ChapterStatus;
  readonly percentage: number;
  readonly startPageId: string | undefined;
}

const ChapterStatusLabel = ({ status }: { readonly status: ChapterStatus }) => {
  switch (status.kind) {
    case 'label':
      return <span>{status.text}</span>;
    case 'count':
      return (
        <span className={styles['guided-route__count']}>
          {`${String(status.read)} de ${String(status.total)}`}
          <VisuallyHidden> páginas leídas</VisuallyHidden>
        </span>
      );
    case 'read':
      return (
        <span className={styles['guided-route__chip']}>
          <Chip read>Leído</Chip>
        </span>
      );
  }
};

interface GuidedRouteProps {
  readonly chapters: readonly GuidedChapter[];
}

export const GuidedRoute = ({ chapters }: GuidedRouteProps) => (
  <ol className={styles['guided-route__list']}>
    {chapters.map((chapter) => (
      <li key={chapter.number} className={styles['guided-route__chapter']}>
        <span
          className={cx(
            styles['guided-route__number'],
            chapter.percentage === 100 && styles['guided-route__number--complete'],
          )}
          aria-hidden="true"
        >
          {chapter.number}
        </span>
        <div className={styles['guided-route__text']}>
          <h3 className={styles['guided-route__title']}>
            {chapter.startPageId ? (
              <Link
                to="/lectura/$pageId"
                params={{ pageId: chapter.startPageId }}
                className={styles['guided-route__link']}
              >
                {chapter.title}
              </Link>
            ) : (
              chapter.title
            )}
          </h3>
          <p className={styles['guided-route__summary']}>{chapter.summary}</p>
        </div>
        <div className={styles['guided-route__status']}>
          <ChapterStatusLabel status={chapter.status} />
          <ProgressBar label={`Progreso de ${chapter.title}`} percentage={chapter.percentage} />
        </div>
      </li>
    ))}
  </ol>
);
