import { useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../../../shared/lib/class-names';
import { IconButton } from '../../../../shared/ui/icon-button/icon-button';
import { VisuallyHidden } from '../../../../shared/ui/visually-hidden/visually-hidden';
import { pageSearch } from '../../data/page-search';
import styles from './search-dialog.module.css';

interface SearchDialogProps {
  readonly onClose: () => void;
}

const FOCUSABLE_SELECTOR = 'button:not([disabled]), input:not([disabled]), [href], [tabindex]';

const resultCountLabel = (count: number): string => {
  if (count === 0) return 'Sin resultados';
  return count === 1 ? '1 resultado' : `${String(count)} resultados`;
};

// Keeps Tab and Shift+Tab inside the dialog, also where native modal focus containment is missing.
const trapTabFocus = (event: KeyboardEvent<HTMLElement>, container: HTMLElement) => {
  const focusable = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => element.tabIndex >= 0,
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

export const SearchDialog = ({ onClose }: SearchDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const listId = `${baseId}-results`;
  const optionId = (index: number) => `${baseId}-option-${String(index)}`;

  const hasQuery = query.trim() !== '';
  const results = pageSearch.search(query);
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

  const openPage = (pageId: string) => {
    onClose();
    void navigate({ to: '/lectura/$pageId', params: { pageId } });
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
      openPage(activeResult.id);
    }
  };

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
        <IconButton
          label="Cerrar búsqueda"
          icon={<X size={18} strokeWidth={1.75} />}
          onClick={onClose}
        />
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
          <ul
            id={listId}
            className={styles['search-dialog__results']}
            role="listbox"
            aria-label="Resultados"
          >
            {results.map((hit, index) => (
              <li
                key={hit.id}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                aria-labelledby={`${optionId(index)}-title`}
                aria-describedby={`${optionId(index)}-category ${optionId(index)}-summary`}
                className={cx(
                  styles['search-dialog__result'],
                  index === activeIndex && styles['search-dialog__result--active'],
                )}
                onMouseMove={() => {
                  if (index !== activeIndex) setActiveIndex(index);
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => {
                  openPage(hit.id);
                }}
              >
                <span id={`${optionId(index)}-title`} className={styles['search-dialog__title']}>
                  {hit.title}
                </span>
                <span
                  id={`${optionId(index)}-category`}
                  className={styles['search-dialog__category']}
                >
                  {hit.category}
                </span>
                <span
                  id={`${optionId(index)}-summary`}
                  className={styles['search-dialog__summary']}
                >
                  {hit.summary}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <p className={styles['search-dialog__hint']}>
        ↑ ↓ para moverte · Enter para abrir · Esc para cerrar
      </p>
    </dialog>
  );
};
