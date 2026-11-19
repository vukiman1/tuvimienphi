import { useId, useRef, useState } from 'react';
import type { ChangeEvent, FocusEvent, KeyboardEvent, ReactElement } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { ContentKind } from '@org/shared-contracts';
import type { KienThucSearchItem } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { cn } from '@/lib/utils';
import { KIND_SEARCH_LABEL } from '../components/kien-thuc-labels';
import type { SearchIndexLoader } from '../content-source';
import { entryPath, lessonPath } from '../kien-thuc-paths';
import type { PublishedLesson } from '../published-pages';
import { searchKienThuc } from './search-match';

const ARROW_DOWN_KEY = 'ArrowDown';
const ARROW_UP_KEY = 'ArrowUp';
const ENTER_KEY = 'Enter';
const ESCAPE_KEY = 'Escape';
const NO_ACTIVE_OPTION = -1;
const SEARCH_LABEL = 'Tra cứu kiến thức tử vi';
const SEARCH_PLACEHOLDER = 'Hoặc tra nhanh: sao, cung, thuật ngữ…';
const LOADING_TEXT = 'Đang tải mục lục…';
const EMPTY_TEXT = 'Không tìm thấy mục nào.';
const NO_ITEMS: readonly KienThucSearchItem[] = [];

const INPUT_CLASS = cn(
  'min-h-12 w-full rounded-full bg-day pl-12 pr-5 text-ink inset-ring-1 inset-ring-ink/20',
  FOCUS_RING_CLASS,
);
const DROPDOWN_CLASS =
  'absolute inset-x-0 top-full z-20 mt-2 rounded-2xl bg-day p-2 text-ink inset-ring-1 inset-ring-ink/15';
const OPTION_CLASS =
  'flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl px-4';
const ACTIVE_OPTION_CLASS = 'inset-ring-2 inset-ring-ink bg-day-200';
const KIND_LABEL_CLASS = 'shrink-0 text-sm text-ink-soft';
const NOTICE_CLASS = 'px-4 py-3 text-sm text-ink-soft';
const FIRST_LESSON_LINK_CLASS = cn(
  'inline-flex min-h-11 items-center px-4 text-sm font-bold text-ink underline',
  FOCUS_RING_CLASS,
);

enum IndexStatus {
  Idle = 'idle',
  Loading = 'loading',
  Ready = 'ready',
}

type IndexState =
  | { readonly status: IndexStatus.Idle }
  | { readonly status: IndexStatus.Loading }
  | { readonly status: IndexStatus.Ready; readonly items: readonly KienThucSearchItem[] };

export interface SearchBoxProps {
  readonly loadSearchIndex: SearchIndexLoader;
  readonly firstLesson: PublishedLesson | undefined;
}

function itemPath(item: KienThucSearchItem): string {
  return item.kind === ContentKind.Bai ? lessonPath(item.slug) : entryPath(item.kind, item.slug);
}

function optionId(listboxId: string, index: number): string {
  return `${listboxId}-option-${index}`;
}

export function SearchBox({ loadSearchIndex, firstLesson }: SearchBoxProps): ReactElement {
  const router = useRouter();
  const listboxId = useId();
  const inputId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [indexState, setIndexState] = useState<IndexState>({ status: IndexStatus.Idle });
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(NO_ACTIVE_OPTION);
  const [isDismissed, setIsDismissed] = useState(false);

  const items = indexState.status === IndexStatus.Ready ? indexState.items : NO_ITEMS;
  const results = searchKienThuc(items, query);
  const hasQuery = query.trim() !== '';
  const isOpen = hasQuery && !isDismissed;
  const hasOptions = isOpen && results.length > 0;
  const isLoading = indexState.status === IndexStatus.Loading;
  const isEmpty = isOpen && indexState.status === IndexStatus.Ready && results.length === 0;

  const startLoading = (): void => {
    if (indexState.status !== IndexStatus.Idle) {
      return;
    }
    setIndexState({ status: IndexStatus.Loading });
    loadSearchIndex().then(
      (loaded) => setIndexState({ status: IndexStatus.Ready, items: loaded }),
      () => setIndexState({ status: IndexStatus.Idle }),
    );
  };

  const handleFocus = (): void => {
    setIsDismissed(false);
    startLoading();
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!wrapperRef.current?.contains(event.relatedTarget)) {
      setIsDismissed(true);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQuery(event.target.value);
    setActiveIndex(NO_ACTIVE_OPTION);
    setIsDismissed(false);
  };

  const open = (item: KienThucSearchItem): void => {
    setIsDismissed(true);
    void router.navigate({ to: itemPath(item) });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === ESCAPE_KEY) {
      setIsDismissed(true);
      return;
    }
    if (event.key === ARROW_DOWN_KEY && hasOptions) {
      event.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, results.length - 1));
      return;
    }
    if (event.key === ARROW_UP_KEY && hasOptions) {
      event.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, NO_ACTIVE_OPTION));
      return;
    }
    const activeItem = results[activeIndex];
    if (event.key === ENTER_KEY && hasOptions && activeItem) {
      event.preventDefault();
      open(activeItem);
    }
  };

  return (
    <div className="relative" onBlur={handleBlur} ref={wrapperRef}>
      <label className="sr-only" htmlFor={inputId}>
        {SEARCH_LABEL}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink"
      />
      <input
        aria-activedescendant={
          hasOptions && activeIndex !== NO_ACTIVE_OPTION
            ? optionId(listboxId, activeIndex)
            : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={hasOptions}
        autoComplete="off"
        className={INPUT_CLASS}
        id={inputId}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={SEARCH_PLACEHOLDER}
        role="combobox"
        type="text"
        value={query}
      />
      <div
        className={DROPDOWN_CLASS}
        hidden={!hasOptions && !isLoading && !isEmpty}
        onMouseDown={(event) => event.preventDefault()}
      >
        <ul aria-label={SEARCH_LABEL} hidden={!hasOptions} id={listboxId} role="listbox">
          {results.map((item, index) => (
            <li
              aria-selected={index === activeIndex}
              className={cn(OPTION_CLASS, index === activeIndex && ACTIVE_OPTION_CLASS)}
              id={optionId(listboxId, index)}
              key={`${item.kind}/${item.slug}`}
              onClick={() => open(item)}
              role="option"
            >
              <span>{item.title}</span>
              <span className={KIND_LABEL_CLASS}>{KIND_SEARCH_LABEL[item.kind]}</span>
            </li>
          ))}
        </ul>
        <div role="status">
          {isLoading && <p className={NOTICE_CLASS}>{LOADING_TEXT}</p>}
          {isEmpty && <p className={NOTICE_CLASS}>{EMPTY_TEXT}</p>}
        </div>
        {isEmpty && firstLesson && (
          <Link
            className={FIRST_LESSON_LINK_CLASS}
            onClick={() => setIsDismissed(true)}
            to={lessonPath(firstLesson.slug)}
          >
            {`Bắt đầu với bài ${firstLesson.title} →`}
          </Link>
        )}
      </div>
    </div>
  );
}
