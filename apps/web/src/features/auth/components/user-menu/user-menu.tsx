import { Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useSignOut } from '../../hooks/use-sign-out';
import { userInitials, type AuthUser } from '../../model/auth-session';
import styles from './user-menu.module.css';

interface UserMenuProps {
  readonly user: AuthUser;
  readonly readCount: number;
  readonly totalPages: number;
}

const PANEL_ID = 'user-menu';

export const UserMenu = ({ user, readCount, totalPages }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const signOut = useSignOut();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // An open dialog (search) handles its own Escape.
      const inDialog = event.target instanceof Element && event.target.closest('dialog[open]');
      if (event.key !== 'Escape' || event.defaultPrevented || inDialog) return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={styles['user-menu']}>
      <button
        ref={buttonRef}
        type="button"
        className={styles['user-menu__avatar']}
        aria-label="Tu cuenta"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        <span aria-hidden="true">{userInitials(user)}</span>
      </button>
      {open ? (
        <div id={PANEL_ID} className={styles['user-menu__panel']}>
          <div className={styles['user-menu__identity']}>
            <p className={styles['user-menu__name']}>{user.name}</p>
            <p className={styles['user-menu__email']}>{user.email}</p>
          </div>
          <Link
            to="/"
            className={styles['user-menu__item']}
            onClick={() => {
              setOpen(false);
            }}
          >
            {`Mi progreso ${String(readCount)} de ${String(totalPages)}`}
          </Link>
          <button
            type="button"
            className={styles['user-menu__item']}
            disabled={signOut.isPending}
            onClick={() => {
              signOut.mutate();
            }}
          >
            Cerrar sesión
          </button>
          <p className={styles['user-menu__error']} role="alert">
            {signOut.isError ? 'No se pudo cerrar la sesión. Inténtalo de nuevo.' : null}
          </p>
        </div>
      ) : null}
    </div>
  );
};
