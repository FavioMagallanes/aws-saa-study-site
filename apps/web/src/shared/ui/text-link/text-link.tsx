import { createLink } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import type { AnchorHTMLAttributes, Ref } from 'react';
import { cx } from '../../lib/class-names';
import styles from './text-link.module.css';

export type TextLinkVariant = 'next' | 'previous' | 'more';

interface TextLinkAnchorProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> {
  readonly variant?: TextLinkVariant;
  readonly ref?: Ref<HTMLAnchorElement>;
}

const icons = {
  next: <ArrowRight size={15} strokeWidth={1.75} />,
  previous: <ArrowLeft size={15} strokeWidth={1.75} />,
  more: <ChevronRight size={15} strokeWidth={1.75} />,
} satisfies Record<TextLinkVariant, React.ReactNode>;

const TextLinkAnchor = ({ variant = 'next', children, ...rest }: TextLinkAnchorProps) => {
  const icon = (
    <span className={styles['text-link__icon']} aria-hidden="true">
      {icons[variant]}
    </span>
  );
  return (
    <a className={cx(styles['text-link'], styles[`text-link--${variant}`])} {...rest}>
      {variant === 'previous' ? icon : null}
      {children}
      {variant === 'previous' ? null : icon}
    </a>
  );
};

export const TextLink = createLink(TextLinkAnchor);
