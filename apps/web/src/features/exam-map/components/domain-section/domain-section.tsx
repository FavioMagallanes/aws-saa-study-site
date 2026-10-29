import { ChevronDown, ChevronRight } from 'lucide-react';
import { cx } from '../../../../shared/lib/class-names';
import type { DomainMap } from '../../model/exam-map';
import { TaskRow } from '../task-row/task-row';
import styles from './domain-section.module.css';

interface DomainSectionProps {
  readonly domain: DomainMap;
  readonly open: boolean;
  readonly onToggle: () => void;
}

export const DomainSection = ({ domain, open, onToggle }: DomainSectionProps) => {
  const panelId = `domain-${String(domain.id)}-tasks`;
  return (
    <li className={styles['domain-section']}>
      <h3>
        <button
          type="button"
          className={styles['domain-section__toggle']}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span
            className={cx(
              styles['domain-section__title'],
              open && styles['domain-section__title--open'],
            )}
          >
            Dominio {domain.id} · {domain.title}
            {open ? null : (
              <span className={styles['domain-section__count']}>{domain.tasks.length} tareas</span>
            )}
          </span>
          <span className={styles['domain-section__icon']} aria-hidden="true">
            {open ? (
              <ChevronDown size={20} strokeWidth={1.75} />
            ) : (
              <ChevronRight size={20} strokeWidth={1.75} />
            )}
          </span>
        </button>
      </h3>
      <ul id={panelId} className={styles['domain-section__tasks']} hidden={!open}>
        {domain.tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </li>
  );
};
