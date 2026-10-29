import { useNavigate } from '@tanstack/react-router';
import { BookA, CornerDownLeft, FileText, Hash, Search, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../../../shared/lib/class-names';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import { siteSearch } from '../../data/page-search';
import type { SearchGroupId, SearchResult, SearchTarget } from '../../model/site-search';
import styles from './search-dialog.module.css';

interface SearchDialogProps {
  readonly onClose: () => void;
  // Text typed while the dialog chunk was loading.
  readonly initialQuery?: string;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]';

const GROUP_ICONS: Readonly<Record<SearchGroupId, LucideIcon>> = {
  abbreviations: BookA,
  pages: FileText,
  headings: Hash,
};

const resultCountLabel = (count: number): string => {
  if (count === 0) return 'Sin resultados';
  return count === 1 ? '1 resultado' : `${String(count)} resultados`;
};

// The desktop and mobile close buttons are hidden by CSS in turn; jsdom has no checkVisibility.
const isRendered = (element: HTMLElement): boolean =>
  !('checkVisibility' in element) || element.checkVisibility();

// Keeps Tab and Shift+Tab inside the dialog, also where native modal focus containment is missing.
const trapTabFocus = (event: KeyboardEvent<HTMLElement>, container: HTMLElement) => {
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => element.tabIndex >= 0 && isRendered(element),
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

export const SearchDialog = ({ onClose, initialQuery = '' }: SearchDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-results`;
  const optionId = (index: number) => `${baseId}-option-${String(index)}`;

  const hasQuery = query.trim() !== '';
  const groups = siteSearch.search(query);
  // Keyboard navigation walks every row in visual order, across groups.
  const results = groups.flatMap((group) => group.results);
  const activeResult = results[activeIndex];

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnTarget = document.activeElement;
    dialog.showModal();
    inputRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      if (returnTarget instanceof HTMLElement) returnTarget.focus();
    };
  }, []);

  const openResult = (target: SearchTarget) => {
    onClose();
    if (target.kind === 'abbreviation') {
      void navigate({ to: '/glosario', hash: target.entryId });
    } else if (target.kind === 'page') {
      void navigate({ to: '/lectura/$pageId', params: { pageId: target.pageId } });
    } else {
      void navigate({
        to: '/lectura/$pageId',
        params: { pageId: target.pageId },
        hash: target.headingId,
      });
    }
  };

  const handleDialogKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'Tab') {
      trapTabFocus(event, event.currentTarget);
    }
  };

  const moveActive = (step: number) => {
    const next = (activeIndex + step + results.length) % results.length;
    setActiveIndex(next);
    document.getElementById(optionId(next))?.scrollIntoView({ block: 'nearest' });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === 'Enter' && activeResult) {
      event.preventDefault();
      openResult(activeResult.target);
    }
  };

  const renderOption = (result: SearchResult, index: number, Icon: LucideIcon) => {
    const id = optionId(index);
    const isActive = index === activeIndex;
    return (
      <div
        key={result.key}
        id={id}
        role="option"
        aria-selected={isActive}
        aria-labelledby={`${id}-title`}
        aria-describedby={result.summary ? `${id}-context ${id}-summary` : `${id}-context`}
        className={cx(
          styles['search-dialog__result'],
          isActive && styles['search-dialog__result--active'],
        )}
        onMouseMove={() => {
          if (!isActive) setActiveIndex(index);
        }}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={() => {
          openResult(result.target);
        }}
      >
        <span className={styles['search-dialog__result-icon']} aria-hidden="true">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <span className={styles['search-dialog__result-text']}>
          <span id={`${id}-title`} className={styles['search-dialog__title']}>
            {result.title}
          </span>
          <span className={styles['search-dialog__secondary']}>
            <span id={`${id}-context`}>{result.context}</span>
            {result.summary ? (
              <>
                <span aria-hidden="true"> · </span>
                <span id={`${id}-summary`}>{result.summary}</span>
              </>
            ) : null}
          </span>
        </span>
        {isActive ? (
          <CornerDownLeft
            className={styles['search-dialog__enter']}
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        ) : null}
      </div>
    );
  };

  const positionedGroups = groups.map((group, groupIndex) => ({
    group,
    firstIndex: groups
      .slice(0, groupIndex)
      .reduce((count, previous) => count + previous.results.length, 0),
  }));

  return (
    <dialog
      ref={dialogRef}
      className={styles['search-dialog']}
      aria-label="Buscar en el sitio"
      onKeyDown={handleDialogKeyDown}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles['search-dialog__header']}>
        <Search
          className={styles['search-dialog__icon']}
          size={18}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          className={styles['search-dialog__input']}
          type="text"
          role="combobox"
          aria-label="Buscar páginas"
          aria-autocomplete="list"
          aria-expanded={results.length > 0}
          aria-controls={listId}
          aria-activedescendant={activeResult ? optionId(activeIndex) : undefined}
          placeholder="Buscar servicio, concepto o sigla"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className={styles['search-dialog__esc']}
          aria-label="Cerrar búsqueda (esc)"
          aria-keyshortcuts="Escape"
          onClick={onClose}
        >
          esc
        </button>
        <button type="button" className={styles['search-dialog__cancel']} onClick={onClose}>
          Cancelar
        </button>
      </div>

      <div role="status">
        <VisuallyHidden>{hasQuery ? resultCountLabel(results.length) : ''}</VisuallyHidden>
      </div>

      <div className={styles['search-dialog__body']}>
        {!hasQuery ? (
          <p className={styles['search-dialog__message']}>
            Escribe el nombre de un servicio, un concepto o una sigla.
          </p>
        ) : null}
        {hasQuery && results.length === 0 ? (
          <p className={styles['search-dialog__message']}>Sin resultados para «{query.trim()}».</p>
        ) : null}
        {results.length > 0 ? (
          <div
            id={listId}
            className={styles['search-dialog__results']}
            role="listbox"
            aria-label="Resultados"
          >
            {positionedGroups.map(({ group, firstIndex }) => {
              const labelId = `${baseId}-group-${group.id}`;
              return (
                <div
                  key={group.id}
                  role="group"
                  aria-labelledby={labelId}
                  className={styles['search-dialog__group']}
                >
                  <div id={labelId} className={styles['search-dialog__group-label']}>
                    {group.label}
                  </div>
                  {group.results.map((result, index) =>
                    renderOption(result, firstIndex + index, GROUP_ICONS[group.id]),
                  )}
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className={styles['search-dialog__footer']}>
        <span className={styles['search-dialog__hints']}>
          <span className={styles['search-dialog__hint']}>
            <kbd className={styles['search-dialog__key']}>↑</kbd>
            <kbd className={styles['search-dialog__key']}>↓</kbd>
            <span>navegar</span>
          </span>
          <span className={styles['search-dialog__hint']}>
            <kbd className={styles['search-dialog__key']}>↵</kbd>
            <span>abrir</span>
          </span>
          <span className={styles['search-dialog__hint']}>
            <kbd className={styles['search-dialog__key']}>esc</kbd>
            <span>cerrar</span>
          </span>
        </span>
        <span>Busca en servicios, siglas y texto</span>
      </div>
    </dialog>
  );
};
