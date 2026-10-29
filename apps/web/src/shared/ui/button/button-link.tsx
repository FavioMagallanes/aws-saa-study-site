import { createLink } from '@tanstack/react-router';
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../lib/class-names';
import type { ButtonVariant } from './button';
import styles from './button.module.css';

interface ButtonAnchorProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  readonly variant?: ButtonVariant;
  readonly trailingIcon?: ReactNode;
  readonly ref?: Ref<HTMLAnchorElement>;
}

const ButtonAnchor = ({
  variant = 'primary',
  trailingIcon,
  children,
  ...rest
}: ButtonAnchorProps) => (
  <a className={cx(styles.button, styles[`button--${variant}`])} {...rest}>
    {children}
    {trailingIcon ? (
      <span className={styles.button__icon} aria-hidden="true">
        {trailingIcon}
      </span>
    ) : null}
  </a>
);

export const ButtonLink = createLink(ButtonAnchor);
