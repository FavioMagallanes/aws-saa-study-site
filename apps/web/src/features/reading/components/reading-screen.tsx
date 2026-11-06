import { Link } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import type { PageMeta } from '@arquitecto/contracts/content';
import { useMediaQuery } from '../../glossary/hooks/use-media-query';
import { cx } from '../../../shared/lib/class-names';
import motion from '../../../shared/styles/motion.module.css';
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

interface PagerLinkProps {
  readonly direction: 'previous' | 'next';
  readonly target: PagerTarget;
}

// The visually hidden colon keeps the accessible name "Siguiente: <title>, en <destination>".
const PagerLink = ({ direction, target }: PagerLinkProps) => {
  const isNext = direction === 'next';
  return (
    <Link
      to="/lectura/$pageId"
      params={{ pageId: target.page.id }}
      className={cx(
        styles['reading__pager-link'],
        styles[isNext ? 'reading__pager-link--next' : 'reading__pager-link--previous'],
      )}
    >
      <span className={styles['reading__pager-label']}>
        {isNext ? null : <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />}
        {isNext ? 'Siguiente' : 'Anterior'}
        <VisuallyHidden>: </VisuallyHidden>
        {isNext ? <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" /> : null}
      </span>
      <span className={styles['reading__pager-title']}>{target.page.title}</span>
      {target.destination ? (
        <span className={styles['reading__pager-destination']}>
          <VisuallyHidden>, en </VisuallyHidden>
          {target.destination}
        </span>
      ) : null}
    </Link>
  );
};

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

      {/* Only the page's own content is keyed, so it fades in on every page change while the
          sidebar, the table of contents and the pager (which may hold focus) stay in place. */}
      <main className={styles.reading__article} ref={articleRef}>
        <div key={`${page.id}-heading`} className={motion['page-enter-group']}>
          <p className={styles.reading__breadcrumb}>{context.breadcrumb.join(' › ')}</p>
          <h1 className={styles.reading__title}>{page.title}</h1>
          {context.examTasks.length > 0 ? <ExamTasks tasks={context.examTasks} /> : null}
        </div>
        {wide ? null : <ReadingToc articleRef={articleRef} pageId={page.id} collapsible />}
        <div key={`${page.id}-body`} className={cx(styles.reading__body, motion['page-enter'])}>
          <ReadingBody Content={Content} />
        </div>
        <nav className={styles.reading__pager} aria-label="Página anterior y siguiente">
          {previous ? <PagerLink direction="previous" target={previous} /> : null}
          {next ? <PagerLink direction="next" target={next} /> : null}
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
