import { ArrowUpRight } from 'lucide-react';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import { toOfficialDocsUrl } from '../../model/official-docs-url';
import styles from './official-source.module.css';

interface OfficialSourceProps {
  readonly title: string;
  readonly url: string;
}

export const OfficialSource = ({ title, url }: OfficialSourceProps) => {
  const docsUrl = toOfficialDocsUrl(url);
  return (
    <a
      className={styles['official-source']}
      href={docsUrl.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className={styles['official-source__title']}>
        {title}
        <ArrowUpRight size={15} strokeWidth={1.75} aria-hidden="true" />
        <VisuallyHidden>(se abre en una pestaña nueva)</VisuallyHidden>
      </span>
      <span className={styles['official-source__url']}>{docsUrl.host + docsUrl.pathname}</span>
    </a>
  );
};
