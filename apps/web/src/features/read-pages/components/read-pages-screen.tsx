import type { PageMeta } from '@arquitecto/contracts/content';
import { Link } from '@tanstack/react-router';
import { SIGN_IN_PATH } from '../../auth/model/return-to';
import type { ProgressStatus } from '../../progress/hooks/use-reading-progress';
import { groupReadPages } from '../../review/model/group-read-pages';
import styles from './read-pages-screen.module.css';

interface ReadPagesScreenProps {
  readonly pages: readonly PageMeta[];
  readonly readPageIds: ReadonlySet<string>;
  readonly progressStatus: ProgressStatus;
  readonly signedIn: boolean;
}

const ReadPagesBody = ({ pages, readPageIds, progressStatus, signedIn }: ReadPagesScreenProps) => {
  if (!signedIn && progressStatus === 'ready') {
    return (
      <p className={styles['read-pages__message']}>
        <Link to={SIGN_IN_PATH} search={{ returnTo: '/leidas' }}>
          Inicia sesión para ver tus páginas leídas
        </Link>
        , porque aquí aparecen las que marcas como leídas.
      </p>
    );
  }
  if (progressStatus === 'loading') {
    return <p className={styles['read-pages__message']}>Cargando tu progreso…</p>;
  }
  if (progressStatus === 'error') {
    return (
      <p className={styles['read-pages__message']}>
        No se pudo cargar tu progreso, así que todavía no podemos mostrar tus páginas leídas.
      </p>
    );
  }

  const groups = groupReadPages(pages, readPageIds);
  if (groups.length === 0) {
    return (
      <p className={styles['read-pages__message']}>
        Aún no has marcado ninguna página como leída. Empieza por la <Link to="/">Ruta</Link>.
      </p>
    );
  }
  return (
    <>
      {groups.map((group) => (
        <section key={group.kind} aria-labelledby={`leidas-${group.kind}`}>
          <h2 id={`leidas-${group.kind}`} className={styles['read-pages__group-title']}>
            {group.label}
          </h2>
          <ul className={styles['read-pages__list']}>
            {group.pages.map((page) => (
              <li key={page.id} className={styles['read-pages__item']}>
                <Link
                  to="/lectura/$pageId"
                  params={{ pageId: page.id }}
                  className={styles['read-pages__link']}
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
};

export const ReadPagesScreen = (props: ReadPagesScreenProps) => (
  <main className={styles['read-pages']}>
    <header className={styles['read-pages__header']}>
      <p className={styles['read-pages__eyebrow']}>Leídas</p>
      <h1 className={styles['read-pages__title']}>Leídas</h1>
      <p className={styles['read-pages__lead']}>
        Las páginas completas que ya marcaste como leídas, para volver a leerlas cuando quieras. Si
        buscas un resumen, usa <Link to="/repaso">Repaso</Link>.
      </p>
    </header>
    <ReadPagesBody {...props} />
  </main>
);
