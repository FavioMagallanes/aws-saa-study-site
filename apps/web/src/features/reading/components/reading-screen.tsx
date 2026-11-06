import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { PageMeta } from '@arquitecto/contracts/content';
import { useMediaQuery } from '../../glossary/hooks/use-media-query';
import { ButtonLink } from '../../../shared/ui/button/button-link';
import { TextLink } from '../../../shared/ui/text-link/text-link';
import { VisuallyHidden } from '../../../shared/ui/visually-hidden/visually-hidden';
import { MarkReadControl } from '../../progress/components/mark-read-control';
import type { PageContent } from '../model/page-content';
import type { PagerTarget, ReadingContext } from '../model/reading-context';
import { ExamTasks } from './exam-tasks/exam-tasks';
import { ReadingBody } from './reading-body/reading-body';
import { ReadingSidebar } from './reading-sidebar/reading-sidebar';
import { ReadingToc } from './reading-toc/reading-toc';
import styles from './reading-screen.module.css';

// Matches the breakpoint in reading-screen.module.css where the sidebar and TOC columns appear.
const WIDE_LAYOUT_QUERY = '(min-width: 1100px)';

interface PagerTextProps {
  readonly label: string;
  readonly target: PagerTarget;
}

const PagerText = ({ label, target }: PagerTextProps) => (
  <span className={styles['reading__pager-text']}>
    <span>
      {label}: {target.page.title}
    </span>
    {target.destination ? (
      <span className={styles['reading__pager-destination']}>
        <VisuallyHidden>, en </VisuallyHidden>
        {target.destination}
      </span>
    ) : null}
  </span>
);

interface ReadingScreenProps {
  readonly page: PageMeta;
  readonly Content: PageContent;
  readonly context: ReadingContext;
}

export const ReadingScreen = ({ page, Content, context }: ReadingScreenProps) => {
  const articleRef = useRef<HTMLElement>(null);
  const { previous, next } = context;
  const wide = useMediaQuery(WIDE_LAYOUT_QUERY);

  return (
    <div className={styles.reading}>
      <aside className={styles.reading__sidebar}>
        <ReadingSidebar key={page.id} sections={context.sidebarSections} />
      </aside>

      <main className={styles.reading__article} ref={articleRef}>
        <p className={styles.reading__breadcrumb}>{context.breadcrumb.join(' › ')}</p>
        <h1 className={styles.reading__title}>{page.title}</h1>
        {context.examTasks.length > 0 ? <ExamTasks tasks={context.examTasks} /> : null}
        {wide ? null : <ReadingToc articleRef={articleRef} pageId={page.id} collapsible />}
        <div className={styles.reading__body}>
          <ReadingBody Content={Content} />
        </div>
        <nav className={styles.reading__pager} aria-label="Página anterior y siguiente">
          {previous ? (
            <TextLink
              to="/lectura/$pageId"
              params={{ pageId: previous.page.id }}
              variant="previous"
            >
              <PagerText label="Anterior" target={previous} />
            </TextLink>
          ) : (
            <span />
          )}
          {next ? (
            <ButtonLink
              to="/lectura/$pageId"
              params={{ pageId: next.page.id }}
              trailingIcon={<ArrowRight size={16} strokeWidth={1.75} />}
            >
              <PagerText label="Siguiente" target={next} />
            </ButtonLink>
          ) : null}
        </nav>
      </main>

      {wide ? (
        <aside className={styles.reading__toc}>
          <ReadingToc articleRef={articleRef} pageId={page.id} />
        </aside>
      ) : null}

      <div className={styles.reading__actions}>
        <MarkReadControl pageId={page.id} />
      </div>
    </div>
  );
};
