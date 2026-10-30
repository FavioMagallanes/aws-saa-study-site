import { Link, useRouterState } from '@tanstack/react-router';
import { UserMenu } from '../../../features/auth/components/user-menu/user-menu';
import { useAuthSession } from '../../../features/auth/hooks/use-auth-session';
import { SIGN_IN_PATH } from '../../../features/auth/model/return-to';
import { loadPages } from '../../../features/content/data/load-pages';
import { summarizeProgress } from '../../../features/content/model/page-progress';
import { useReadingProgress } from '../../../features/progress/hooks/use-reading-progress';
import styles from './top-bar.module.css';

const pages = loadPages();

// Composes the auth and progress features: "Iniciar sesión" or the avatar with its menu.
export const AccountAction = () => {
  const auth = useAuthSession();
  const { readPageIds } = useReadingProgress();
  const currentHref = useRouterState({ select: (state) => state.location.href });

  if (auth.status === 'checking') return null;
  if (auth.status === 'signed-out') {
    return (
      <Link
        to={SIGN_IN_PATH}
        search={{ returnTo: currentHref }}
        className={styles['top-bar__sign-in']}
      >
        Iniciar sesión
      </Link>
    );
  }
  return (
    <UserMenu
      user={auth.user}
      readCount={summarizeProgress(pages, readPageIds).read}
      totalPages={pages.length}
    />
  );
};
