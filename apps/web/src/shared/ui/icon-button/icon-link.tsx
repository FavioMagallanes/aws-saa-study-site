import { createLink } from '@tanstack/react-router';
import type { AnchorHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './icon-button.module.css';

interface IconLinkAnchorProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className' | 'children' | 'aria-label'
> {
  readonly label: string;
  readonly icon: ReactNode;
  readonly ref?: Ref<HTMLAnchorElement>;
}

const IconLinkAnchor = ({ label, icon, ...rest }: IconLinkAnchorProps) => (
  <a className={styles['icon-button']} aria-label={label} {...rest}>
    <span aria-hidden="true">{icon}</span>
  </a>
);

export const IconLink = createLink(IconLinkAnchor);
