import type { PageMeta } from '@arquitecto/contracts/content';
import { Link } from '@tanstack/react-router';
import { SIGN_IN_PATH } from '../../auth/model/return-to';
import type { ProgressStatus } from '../../progress/hooks/use-reading-progress';
import { buildReview, type ReviewEntry } from '../model/build-review';
import type { ReviewDigest } from '../scripts/extract-review-digest';
import styles from './review-screen.module.css';

interface ReviewScreenProps {
  readonly pages: readonly PageMeta[];
  readonly digests: Readonly<Record<string, ReviewDigest>>;
  readonly readPageIds: ReadonlySet<string>;
  readonly progressStatus: ProgressStatus;
  readonly signedIn: boolean;
}

const ReviewCard = ({ page, digest }: ReviewEntry) => (
  <article className={styles.review__card}>
    <h3 className={styles['review__card-title']}>{page.title}</h3>
    <p className={styles.review__intro}>{digest.intro}</p>
    <details className={styles.review__details}>
      <summary className={styles['review__details-summary']}>Ideas clave y cuándo usarlo</summary>
      {digest.problem ? (
        <p className={styles.review__problem}>
          <strong>Qué problema resuelve:</strong> {digest.problem}
        </p>
      ) : null}
      {digest.concepts.length > 0 ? (
        <>
          <h4 className={styles.review__subheading}>Ideas clave</h4>
          <ul className={styles.review__list}>
            {digest.concepts.map((concept) => (
              <li key={concept.term}>
                <strong>{concept.term}</strong>
                {concept.summary ? `: ${concept.summary}` : null}
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {digest.whenToUse.length > 0 ? (
        <>
          <h4 className={styles.review__subheading}>Cuándo elegirlo</h4>
          <ul className={styles.review__list}>
            {digest.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
    </details>
    <Link
      to="/lectura/$pageId"
      params={{ pageId: page.id }}
      className={styles.review__reread}
      aria-label={`Volver a leer ${page.title}`}
    >
      Volver a leer
    </Link>
  </article>
);

const ReviewBody = ({
  pages,
  digests,
  readPageIds,
  progressStatus,
  signedIn,
}: ReviewScreenProps) => {
  if (!signedIn && progressStatus === 'ready') {
    return (
      <p className={styles.review__message}>
        <Link to={SIGN_IN_PATH} search={{ returnTo: '/repaso' }}>
          Inicia sesión para ver tu repaso
        </Link>
        , porque se arma con las páginas que marcas como leídas.
      </p>
    );
  }
  if (progressStatus === 'loading') {
    return <p className={styles.review__message}>Cargando tu progreso…</p>;
  }
  if (progressStatus === 'error') {
    return (
      <p className={styles.review__message}>
        No se pudo cargar tu progreso, así que todavía no hay repaso que mostrar.
      </p>
    );
  }

  const groups = buildReview(pages, digests, readPageIds);
  if (groups.length === 0) {
    return (
      <p className={styles.review__message}>
        Aún no hay nada que repasar. Marca una página como leída y aparecerá aquí.
      </p>
    );
  }
  return (
    <>
      {groups.map((group) => (
        <section key={group.kind} aria-labelledby={`repaso-${group.kind}`}>
          <h2 id={`repaso-${group.kind}`} className={styles['review__group-title']}>
            {group.label}
          </h2>
          <div className={styles.review__cards}>
            {group.entries.map((entry) => (
              <ReviewCard key={entry.page.id} {...entry} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

export const ReviewScreen = (props: ReviewScreenProps) => (
  <main className={styles.review}>
    <header className={styles.review__header}>
      <p className={styles.review__eyebrow}>Repaso</p>
      <h1 className={styles.review__title}>Repaso</h1>
      <p className={styles.review__lead}>
        Un resumen de lo que ya leíste: qué es cada tema, sus ideas clave y cuándo elegirlo. Úsalo
        para refrescar la memoria y vuelve a la página completa cuando algo no te suene.
      </p>
    </header>
    <ReviewBody {...props} />
  </main>
);
