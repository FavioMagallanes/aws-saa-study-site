import { Link } from '@tanstack/react-router';
import styles from './site-footer.module.css';

export const SiteFooter = () => (
  <footer className={styles['site-footer']}>
    <p className={styles['site-footer__note']}>
      Basado en la Guía de examen SAA-C03 y en docs.aws.amazon.com. No es material oficial de AWS.
    </p>
    <nav className={styles['site-footer__links']} aria-label="Pie de página">
      <Link to="/glosario" className={styles['site-footer__link']}>
        Glosario de siglas
      </Link>
      <span aria-hidden="true">·</span>
      <Link to="/mapa-del-examen" className={styles['site-footer__link']}>
        Mapa del examen
      </Link>
    </nav>
  </footer>
);
