import type { PageMeta } from '@arquitecto/contracts/content';
import { TextLink } from '../../../shared/ui/text-link/text-link';
import type { ExamGuide } from '../../content/model/exam-guide';
import {
  DOMAIN_HIGHLIGHTS,
  FEATURED_SERVICE_CATEGORIES,
  FUNDAMENTALS_SUMMARY,
  VISIBLE_SERVICES_PER_CATEGORY,
} from '../model/home-copy';
import {
  nextPageToRead,
  summarizeProgress,
  type ReadPageIds,
} from '../../content/model/page-progress';
import {
  countCategories,
  overviewDomains,
  overviewServiceCategories,
} from '../model/home-overview';
import { ContinueCard } from './continue-card/continue-card';
import { GuidedRoute, type GuidedChapter } from './guided-route/guided-route';
import { ServiceIndex } from './service-index/service-index';
import styles from './home-screen.module.css';

interface HomeScreenProps {
  readonly pages: readonly PageMeta[];
  readonly guide: ExamGuide;
  readonly readPageIds: ReadPageIds;
  readonly lastReadTitle?: string;
}

export const HomeScreen = ({ pages, guide, readPageIds, lastReadTitle }: HomeScreenProps) => {
  const fundamentals = pages.filter((page) => page.kind === 'fundamental');
  const fundamentalsSummary = summarizeProgress(fundamentals, readPageIds);

  const chapters: GuidedChapter[] = [
    {
      number: 0,
      title: 'Fundamentos',
      summary: FUNDAMENTALS_SUMMARY,
      statusLabel: 'Base',
      percentage: fundamentalsSummary.percentage,
      startPageId: nextPageToRead(fundamentals, readPageIds)?.id,
    },
    ...overviewDomains(pages, guide, readPageIds).map((domain) => ({
      number: domain.id,
      title: domain.title,
      summary: `Tareas ${domain.firstTask} – ${domain.lastTask} · ${DOMAIN_HIGHLIGHTS[domain.id] ?? ''}`,
      statusLabel: `Peso ${String(domain.weight)} %`,
      percentage: domain.summary.percentage,
      startPageId: domain.startPageId,
    })),
  ];

  return (
    <main className={styles.home}>
      <section className={styles.home__hero}>
        <p className={styles.home__eyebrow}>
          Guía de lectura · AWS Certified Solutions Architect – Associate
        </p>
        <h1 className={styles.home__title}>
          Entiende AWS como un arquitecto: qué hace cada servicio y cómo encaja con los demás.
        </h1>
        <p className={styles.home__lead}>
          Explicaciones propias, escritas a partir de la guía oficial del examen y de la
          documentación de AWS. Sin simulacros: solo lectura, con la fuente de cada tema a un clic.
        </p>
        <ContinueCard
          summary={summarizeProgress(pages, readPageIds)}
          nextPage={nextPageToRead(pages, readPageIds)}
          {...(lastReadTitle === undefined ? {} : { lastReadTitle })}
        />
      </section>

      <section className={styles.home__section} aria-labelledby="home-route">
        <h2 id="home-route" className={styles['home__section-title']}>
          Ruta guiada
        </h2>
        <p className={styles['home__section-lead']}>
          Sigue el orden de la guía oficial. El peso indica qué parte del puntaje cubre cada
          dominio.
        </p>
        <GuidedRoute chapters={chapters} />
      </section>

      <section className={styles.home__section} aria-labelledby="home-services">
        <h2 id="home-services" className={styles['home__section-title']}>
          Índice de servicios
        </h2>
        <p className={styles['home__section-lead']}>
          Todos los servicios que la guía declara dentro del alcance, agrupados como en la guía.
        </p>
        <ServiceIndex
          categories={overviewServiceCategories(
            pages,
            guide,
            FEATURED_SERVICE_CATEGORIES,
            readPageIds,
            VISIBLE_SERVICES_PER_CATEGORY,
          )}
        />
        <TextLink to="/servicios">Ver las {countCategories(guide)} categorías</TextLink>
      </section>
    </main>
  );
};
