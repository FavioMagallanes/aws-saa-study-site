import { Link } from '@tanstack/react-router';
import { Menu, Moon, Search, Sun, X } from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '../../../features/theme/store/use-theme-store';
import { IconButton } from '../../../shared/ui/icon-button/icon-button';
import { IconLink } from '../../../shared/ui/icon-button/icon-link';
import styles from './top-bar.module.css';

const NAV_ITEMS = [
  { label: 'Ruta', to: '/' },
  { label: 'Servicios', to: '/servicios' },
  { label: 'Arquitecturas', to: '/arquitecturas' },
  { label: 'Glosario', to: '/glosario' },
] as const;

export const TopBar = () => {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = NAV_ITEMS.map((item) => (
    <Link
      key={item.to}
      to={item.to}
      className={styles['top-bar__link']}
      activeOptions={{ exact: item.to === '/' }}
      onClick={() => {
        setMenuOpen(false);
      }}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className={styles['top-bar']}>
      <div className={styles['top-bar__inner']}>
        <Link to="/" className={styles['top-bar__brand']} aria-label="Arquitecto · SAA-C03, inicio">
          <span className={styles['top-bar__brand-name']}>Arquitecto</span>
          <span className={styles['top-bar__exam-tag']}>SAA-C03</span>
        </Link>
        <nav className={styles['top-bar__nav']} aria-label="Principal">
          {navLinks}
        </nav>
        <div className={styles['top-bar__actions']}>
          <Link to="/buscar" className={styles['top-bar__search']}>
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles['top-bar__search-text']}>
              Buscar servicio, concepto o sigla
            </span>
            <kbd className={styles['top-bar__shortcut']}>⌘K</kbd>
          </Link>
          <span className={styles['top-bar__mobile-only']}>
            <IconLink to="/buscar" label="Buscar" icon={<Search size={18} strokeWidth={1.75} />} />
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
          <span className={styles['top-bar__mobile-only']}>
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
        <nav
          id="mobile-menu"
          className={`${styles['top-bar__menu-panel'] ?? ''} ${styles['top-bar__mobile-only'] ?? ''}`}
          aria-label="Principal"
        >
          {navLinks}
        </nav>
      ) : null}
    </header>
  );
};
