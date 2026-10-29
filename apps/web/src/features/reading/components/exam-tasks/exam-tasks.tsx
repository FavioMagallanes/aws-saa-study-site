import { useId } from 'react';
import styles from './exam-tasks.module.css';

export interface ExamTask {
  readonly id: string;
  readonly title: string;
}

interface ExamTasksProps {
  readonly tasks: readonly ExamTask[];
}

export const ExamTasks = ({ tasks }: ExamTasksProps) => {
  const labelId = useId();
  return (
    <section className={styles['exam-tasks']} aria-labelledby={labelId}>
      <p id={labelId} className={styles['exam-tasks__label']}>
        En el examen
      </p>
      <ul className={styles['exam-tasks__list']}>
        {tasks.map((task) => (
          <li key={task.id} className={styles['exam-tasks__task']}>
            Tarea {task.id} · {task.title}
          </li>
        ))}
      </ul>
    </section>
  );
};
