import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '../../lib/class-names';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'read';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  readonly variant?: ButtonVariant;
  readonly leadingIcon?: ReactNode;
  readonly trailingIcon?: ReactNode;
}

export const Button = ({
  variant = 'primary',
  leadingIcon,
  trailingIcon,
  type = 'button',
  children,
  ...rest
}: ButtonProps) => (
  <button type={type} className={cx(styles.button, styles[`button--${variant}`])} {...rest}>
    {leadingIcon ? (
      <span className={styles.button__icon} aria-hidden="true">
        {leadingIcon}
      </span>
    ) : null}
    {children}
    {trailingIcon ? (
      <span className={styles.button__icon} aria-hidden="true">
        {trailingIcon}
      </span>
    ) : null}
  </button>
);
