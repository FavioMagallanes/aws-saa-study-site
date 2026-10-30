import type { PageMeta } from '@arquitecto/contracts/content';
import { Link } from '@tanstack/react-router';
import type { ExamGuide } from '../../content/model/exam-guide';
import type { ReadPageIds } from '../../content/model/page-progress';
import type { ProgressStatus } from '../../progress/hooks/use-reading-progress';
import {
  buildServiceCategories,
  countGuideServices,
  formatReadCount,
} from '../model/service-categories';
import { ReadMark } from './read-mark/read-mark';
import styles from './services-index-screen.module.css';

interface ServicesIndexScreenProps {
  readonly pages: readonly PageMeta[];
  readonly guide: ExamGuide;
  readonly readPageIds: ReadPageIds;
  readonly progressStatus: ProgressStatus;
}

export const ServicesIndexScreen = ({
  pages,
  guide,
  readPageIds,
  progressStatus,
}: ServicesIndexScreenProps) => {
  const categories = buildServiceCategories(pages, guide, readPageIds);

  return (
    <main className={styles['services-index']}>
      <header className={styles['services-index__header']}>
        <p className={styles['services-index__eyebrow']}>Servicios</p>
        <h1 className={styles['services-index__title']}>Los servicios que cubre la guía</h1>
        <p className={styles['services-index__lead']}>
          {`Los ${String(countGuideServices(guide))} servicios que la guía declara dentro del alcance, agrupados en sus ${String(categories.length)} categorías, como en la guía oficial. Cada nombre abre su página; las que ya leíste llevan una marca.`}
        </p>
      </header>

      <ul className={styles['services-index__categories']}>
        {categories.map((category) => (
          <li key={category.name} className={styles['services-index__category']}>
            <div className={styles['services-index__category-header']}>
              <h2 className={styles['services-index__category-title']}>{category.name}</h2>
              {progressStatus === 'ready' ? (
                <p className={styles['services-index__count']}>
                  {formatReadCount(category.readCount, category.services.length)}
                </p>
              ) : null}
            </div>
            <ul className={styles['services-index__services']}>
              {category.services.map((service) => (
                <li key={service.pageId} className={styles['services-index__service']}>
                  <Link
                    to="/lectura/$pageId"
                    params={{ pageId: service.pageId }}
                    className={styles['services-index__service-link']}
                  >
                    {service.name}
                  </Link>
                  {service.read ? <ReadMark /> : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
};
