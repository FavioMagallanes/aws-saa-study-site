import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './icon-button.module.css';

interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'children' | 'aria-label'
> {
  readonly label: string;
  readonly icon: ReactNode;
}

export const IconButton = ({ label, icon, type = 'button', ...rest }: IconButtonProps) => (
  <button type={type} className={styles['icon-button']} aria-label={label} {...rest}>
    <span aria-hidden="true">{icon}</span>
  </button>
);
