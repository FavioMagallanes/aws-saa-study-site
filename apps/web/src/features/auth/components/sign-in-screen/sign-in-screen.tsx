import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { useId } from 'react';
import { useSignIn } from '../../hooks/use-sign-in';
import { SIGN_IN_BENEFITS, SIGN_IN_PROVIDER, SIGN_IN_SUBTITLE } from '../../model/sign-in-copy';
import styles from './sign-in-screen.module.css';

interface SignInScreenProps {
  // Already validated as a same-origin path.
  readonly returnTo: string;
}

export const SignInScreen = ({ returnTo }: SignInScreenProps) => {
  const signIn = useSignIn();
  const titleId = useId();

  return (
    <main className={styles['sign-in']}>
      <section className={styles['sign-in__intro']}>
        <p className={styles['sign-in__eyebrow']}>GUARDA TU PROGRESO</p>
        <h1 className={styles['sign-in__headline']}>
          Sigue tu ruta de estudio desde cualquier lugar
        </h1>
        <p className={styles['sign-in__lead']}>
          Inicia sesión para marcar lo que ya leíste y retomarlo en tu teléfono, tu tableta o tu
          computadora. Leer sigue siendo libre: no necesitas cuenta para estudiar.
        </p>
        <ul className={styles['sign-in__benefits']} aria-label="Ventajas de iniciar sesión">
          {SIGN_IN_BENEFITS.map((benefit) => (
            <li key={benefit.title} className={styles['sign-in__benefit']}>
              <span className={styles['sign-in__check']} aria-hidden="true">
                <Check size={14} strokeWidth={2} />
              </span>
              <span className={styles['sign-in__benefit-body']}>
                <strong className={styles['sign-in__benefit-title']}>{benefit.title}</strong>
                <span className={styles['sign-in__benefit-text']}>{benefit.text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles['sign-in__panel']}>
        <section className={styles['sign-in__card']} aria-labelledby={titleId}>
          <h2 id={titleId} className={styles['sign-in__title']}>
            Inicia sesión
          </h2>
          <p className={styles['sign-in__subtitle']}>{SIGN_IN_SUBTITLE}</p>
          <button
            type="button"
            className={styles['sign-in__provider']}
            disabled={signIn.isPending}
            onClick={() => {
              signIn.mutate({ provider: SIGN_IN_PROVIDER.provider, returnTo });
            }}
          >
            {SIGN_IN_PROVIDER.label}
          </button>
          <p className={styles['sign-in__error']} role="alert">
            {signIn.isError ? 'No se pudo iniciar sesión. Inténtalo de nuevo.' : null}
          </p>
          <p className={styles['sign-in__read-only']}>
            ¿Solo quieres leer?{' '}
            <Link to="/" className={styles['sign-in__read-only-link']}>
              Sigue sin cuenta <span aria-hidden="true">→</span>
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};
