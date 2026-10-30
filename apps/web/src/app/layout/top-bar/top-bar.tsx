import { Link } from '@tanstack/react-router';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { LazySearchDialog } from '../../../features/search/components/lazy-search-dialog';
import { useSearchDialog } from '../../../features/search/hooks/use-search-dialog';
import { useThemeStore } from '../../../features/theme/store/use-theme-store';
import { IconButton } from '../../../shared/ui/icon-button/icon-button';
import { AccountAction } from './account-action';
import styles from './top-bar.module.css';

const NAV_ITEMS = [
  { label: 'Ruta', to: '/' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Arquitecturas', to: '/arquitecturas' },
  { label: 'Glosario', to: '/glosario' },
] as const;

const TopBarBrand = () => (
  <Link to="/" className={styles['top-bar__brand']} aria-label="Arquitecto · SAA-C03, inicio">
    <span className={styles['top-bar__brand-name']}>Arquitecto</span>
    <span className={styles['top-bar__exam-tag']}>SAA-C03</span>
  </Link>
);

// The sign-in screens show only the brand: no navigation, search, theme or menu.
export const BrandTopBar = () => (
  <header className={styles['top-bar']}>
    <div className={styles['top-bar__inner']}>
      <TopBarBrand />
    </div>
  </header>
);

export const TopBar = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLSpanElement>(null);
  const search = useSearchDialog();

  const closeMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.querySelector('button')?.focus();
  };

  const openSearch = () => {
    setMenuOpen(false);
    search.open();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      // An open dialog (search) handles its own Escape.
      const inDialog = event.target instanceof Element && event.target.closest('dialog[open]');
      if (event.key !== 'Escape' || event.defaultPrevented || inDialog) return;
      setMenuOpen(false);
      menuButtonRef.current?.querySelector('button')?.focus();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const navLinks = NAV_ITEMS.map((item) => (
    <Link
      key={item.to}
      to={item.to}
      className={styles['top-bar__link']}
      activeOptions={{ exact: item.to === '/' }}
    >
      {item.label}
    </Link>
  ));

  const menuLinks = NAV_ITEMS.map((item) => (
    <Link
      key={item.to}
      to={item.to}
      className={styles['top-bar__menu-link']}
      activeOptions={{ exact: item.to === '/' }}
      onClick={closeMenu}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className={styles['top-bar']}>
      <div className={styles['top-bar__inner']}>
        <TopBarBrand />
        <nav className={styles['top-bar__nav']} aria-label="Principal">
          {navLinks}
        </nav>
        <div className={styles['top-bar__actions']}>
          <button
            type="button"
            className={styles['top-bar__search']}
            aria-haspopup="dialog"
            aria-keyshortcuts="Meta+K Control+K"
            onClick={openSearch}
          >
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles['top-bar__search-text']}>
              Buscar servicio, concepto o sigla
            </span>
            <kbd className={styles['top-bar__shortcut']} aria-hidden="true">
              ⌘K
            </kbd>
          </button>
          <span className={styles['top-bar__mobile-only']}>
            <IconButton
              label="Buscar"
              aria-haspopup="dialog"
              icon={<Search size={18} strokeWidth={1.75} />}
              onClick={openSearch}
            />
          </span>
          <IconButton
            label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            icon={
              theme === 'light' ? (
                <Moon size={18} strokeWidth={1.75} />
              ) : (
                <Sun size={18} strokeWidth={1.75} />
              )
            }
            onClick={toggleTheme}
          />
          <AccountAction />
          <span className={styles['top-bar__mobile-only']} ref={menuButtonRef}>
            <IconButton
              label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              icon={
                menuOpen ? (
                  <X size={18} strokeWidth={1.75} />
                ) : (
                  <Menu size={18} strokeWidth={1.75} />
                )
              }
              onClick={() => {
                setMenuOpen((open) => !open);
              }}
            />
          </span>
        </div>
      </div>
      {menuOpen ? (
        <>
          <div
            className={styles['top-bar__menu-scrim']}
            data-testid="mobile-menu-scrim"
            aria-hidden="true"
            onClick={closeMenu}
          />
          <nav id="mobile-menu" className={styles['top-bar__menu-panel']} aria-label="Principal">
            {menuLinks}
          </nav>
        </>
      ) : null}
      {search.isOpen ? (
        <Suspense fallback={null}>
          <LazySearchDialog onClose={search.close} initialQuery={search.pendingQuery} />
        </Suspense>
      ) : null}
    </header>
  );
};
