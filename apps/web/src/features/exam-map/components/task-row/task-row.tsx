import { Link } from '@tanstack/react-router';
import { Chip } from '../../../../shared/ui/chip/chip';
import type { TaskMap } from '../../model/exam-map';
import styles from './task-row.module.css';

interface TaskRowProps {
  readonly task: TaskMap;
}

export const TaskRow = ({ task }: TaskRowProps) => (
  <li className={styles['task-row']}>
    <div className={styles['task-row__info']}>
      <span className={styles['task-row__code']}>Tarea {task.id}</span>
      <h4 className={styles['task-row__title']}>{task.title}</h4>
      <span className={styles['task-row__count']}>
        {task.readCount} de {task.pages.length} páginas leídas
      </span>
    </div>
    <ul className={styles['task-row__pages']}>
      {task.pages.map((page) => (
        <li key={page.id}>
          <Link
            to="/lectura/$pageId"
            params={{ pageId: page.id }}
            className={styles['task-row__page-link']}
          >
            <Chip read={page.read}>{page.title}</Chip>
          </Link>
        </li>
      ))}
    </ul>
  </li>
);
