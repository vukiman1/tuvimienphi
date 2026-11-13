import { useState, type ReactElement } from 'react';
import { ChevronDown } from 'lucide-react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { RichText } from '@/features/la-so/components/rich-text';
import { cn } from '@/lib/utils';

export interface AccordionEntry {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly badge?: string;
  readonly paragraphs: readonly string[];
}

const PARAGRAPH_KEY_LENGTH = 40;

function AccordionItem({
  entry,
  isOpen,
  onToggle,
}: {
  readonly entry: AccordionEntry;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}): ReactElement {
  const bodyId = `${entry.id}-body`;

  return (
    <section className="mt-3 rounded-xl border border-ink/15 bg-day" id={entry.id}>
      <h5>
        <button
          aria-controls={bodyId}
          aria-expanded={isOpen}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-day-200',
            FOCUS_RING_CLASS,
          )}
          onClick={onToggle}
          type="button"
        >
          <span className="text-lg font-bold text-ink">{entry.title}</span>
          <span className="text-sm text-ink-soft">{entry.meta}</span>
          {entry.badge && (
            <span className="rounded-full bg-night px-2.5 py-0.5 text-xs font-semibold text-day">
              {entry.badge}
            </span>
          )}
          <span aria-hidden className="h-px flex-1 bg-ink/15" />
          <ChevronDown
            aria-hidden
            className={cn('size-5 shrink-0 text-ink transition-transform', isOpen && 'rotate-180')}
          />
        </button>
      </h5>

      <div
        aria-hidden={!isOpen}
        className={cn(
          'grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
        id={bodyId}
      >
        <div
          className={cn(
            'min-h-0 transition-opacity duration-200 motion-reduce:transition-none',
            isOpen ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="px-4 pb-4">
            {entry.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, PARAGRAPH_KEY_LENGTH)} className="mt-2">
                <RichText text={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface LuanGiaiAccordionProps {
  readonly entries: readonly AccordionEntry[];
  readonly defaultOpenId?: string;
}

export function LuanGiaiAccordion({
  entries,
  defaultOpenId,
}: LuanGiaiAccordionProps): ReactElement {
  const [openIds, setOpenIds] = useState<readonly string[]>(defaultOpenId ? [defaultOpenId] : []);
  const isAllOpen = openIds.length === entries.length;

  const toggle = (id: string): void =>
    setOpenIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-soft">{entries.length} mục · bấm để mở</p>
        <button
          className={cn(
            'text-sm font-semibold text-ink underline-offset-4 hover:underline',
            FOCUS_RING_CLASS,
          )}
          onClick={() => setOpenIds(isAllOpen ? [] : entries.map((item) => item.id))}
          type="button"
        >
          {isAllOpen ? 'Thu gọn tất cả' : 'Mở tất cả'}
        </button>
      </div>

      {entries.map((entry) => (
        <AccordionItem
          key={entry.id}
          entry={entry}
          isOpen={openIds.includes(entry.id)}
          onToggle={() => toggle(entry.id)}
        />
      ))}
    </div>
  );
}
