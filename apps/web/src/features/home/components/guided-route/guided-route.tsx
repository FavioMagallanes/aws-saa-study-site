import { Link } from '@tanstack/react-router';
import { cx } from '../../../../shared/lib/class-names';
import { ProgressBar } from '../../../../shared/ui/progress-bar/progress-bar';
import styles from './guided-route.module.css';

export interface GuidedChapter {
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly statusLabel: string;
  readonly percentage: number;
  readonly startPageId: string | undefined;
}

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
          <span>{chapter.statusLabel}</span>
          <ProgressBar label={`Progreso de ${chapter.title}`} percentage={chapter.percentage} />
        </div>
      </li>
    ))}
  </ol>
);
