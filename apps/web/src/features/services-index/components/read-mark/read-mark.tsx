import { Check } from 'lucide-react';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import styles from './read-mark.module.css';

// Same mark as the home service index: a check icon announced as "(leído)".
export const ReadMark = () => (
  <span className={styles['read-mark']}>
    <Check size={14} strokeWidth={1.75} aria-hidden="true" />
    <VisuallyHidden>(leído)</VisuallyHidden>
  </span>
);
