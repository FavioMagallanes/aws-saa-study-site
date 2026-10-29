import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { PageMeta } from '@arquitecto/contracts/content';
import { ButtonLink } from '../../../shared/ui/button/button-link';
import { TextLink } from '../../../shared/ui/text-link/text-link';
import { MarkReadControl } from '../../progress/components/mark-read-control';
import type { PageContent } from '../model/page-content';
import type { ReadingContext } from '../model/reading-context';
import { ExamTasks } from './exam-tasks/exam-tasks';
import { ReadingBody } from './reading-body/reading-body';
import { ReadingSidebar } from './reading-sidebar/reading-sidebar';
import { ReadingToc } from './reading-toc/reading-toc';
import styles from './reading-screen.module.css';

interface ReadingScreenProps {
  readonly page: PageMeta;
  readonly Content: PageContent;
  readonly context: ReadingContext;
}

export const ReadingScreen = ({ page, Content, context }: ReadingScreenProps) => {
  const articleRef = useRef<HTMLElement>(null);
  const { previous, next } = context;

  return (
    <div className={styles.reading}>
      <aside className={styles.reading__sidebar}>
        <ReadingSidebar heading={context.sidebarHeading} groups={context.sidebarGroups} />
      </aside>

      <main className={styles.reading__article} ref={articleRef}>
        <p className={styles.reading__breadcrumb}>{context.breadcrumb.join(' / ')}</p>
        <h1 className={styles.reading__title}>{page.title}</h1>
        {context.examTasks.length > 0 ? <ExamTasks tasks={context.examTasks} /> : null}
        <div className={styles.reading__body}>
          <ReadingBody Content={Content} />
        </div>
        <nav className={styles.reading__pager} aria-label="Página anterior y siguiente">
          {previous ? (
            <TextLink to="/lectura/$pageId" params={{ pageId: previous.id }} variant="previous">
              {previous.title}
            </TextLink>
          ) : (
            <span />
          )}
          {next ? (
            <ButtonLink
              to="/lectura/$pageId"
              params={{ pageId: next.id }}
              trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
            >
              Siguiente: {next.title}
            </ButtonLink>
          ) : null}
        </nav>
      </main>

      <aside className={styles.reading__toc}>
        <ReadingToc articleRef={articleRef} pageId={page.id} />
      </aside>

      <div className={styles.reading__actions}>
        <MarkReadControl pageId={page.id} />
      </div>
    </div>
  );
};
