import { useRef, useState, type ReactElement } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import {
  Chip,
  DisplaySize,
  DisplayTitle,
  FOCUS_RING_CLASS,
  StarRating,
  TitleFace,
} from '@/design-system';
import { HourDetailDialog } from '@/features/ngay-tot/components/hour-detail-dialog';
import { HourDial } from '@/features/ngay-tot/components/hour-dial';
import type { HourEntry, HourQuality } from '@/features/ngay-tot/hour-quality';
import { cn } from '@/lib/utils';

const HOURS_PER_CHI = 2;
const HOURS_PER_DAY = 24;

interface HourQualityListProps {
  readonly items: readonly HourQuality[];
  readonly isToday: boolean;
}

function currentChiIndex(): number {
  const hour = new Date().getHours();
  return Math.floor(((hour + 1) % HOURS_PER_DAY) / HOURS_PER_CHI);
}

interface GroupLabelProps {
  readonly text: string;
}

function GroupLabel({ text }: GroupLabelProps): ReactElement {
  return (
    <div className="mt-10 flex items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-ink/15" />
      <h3 className="font-emphasis text-xl font-bold text-ink">{text}</h3>
      <span aria-hidden className="h-px flex-1 bg-ink/15" />
    </div>
  );
}

function HourCard({
  entry,
  onOpen,
}: {
  readonly entry: HourEntry;
  readonly onOpen: (opener: HTMLButtonElement) => void;
}): ReactElement {
  const { item, chiIndex, isNow } = entry;

  return (
    <button
      className={cn(
        'block h-full w-full min-w-0 rounded-xl transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        FOCUS_RING_CLASS,
      )}
      onClick={(event) => onOpen(event.currentTarget)}
      type="button"
    >
      <span
        className={cn(
          'flex h-full flex-col items-center gap-2 rounded-xl px-2 py-4',
          item.isHoangDao ? 'border-2 border-gold bg-day' : 'border border-ink/15 bg-day-200',
          isNow && 'inset-ring-2 inset-ring-gold',
        )}
      >
        <span className="font-display text-sm font-extrabold text-ink tabular-nums">
          {item.range}
        </span>
        <HourDial chiIndex={chiIndex} className="size-12" />
        <span className="text-base font-bold text-ink">{item.canChi}</span>
        {isNow ? (
          <span className="rounded-full bg-gold px-2 py-0.5 text-2xs font-bold text-ink">
            Bây giờ
          </span>
        ) : (
          <span className="text-xs text-ink-soft">{item.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}</span>
        )}
        <StarRating className="justify-center" rating={item.rating} />
        <ChevronDown aria-hidden className="size-5 text-ink" />
      </span>
    </button>
  );
}

function HourGrid({
  entries,
  onOpen,
}: {
  readonly entries: readonly HourEntry[];
  readonly onOpen: (entry: HourEntry, opener: HTMLButtonElement) => void;
}): ReactElement {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
      {entries.map((entry) => (
        <li className="min-w-0" key={entry.item.range}>
          <HourCard entry={entry} onOpen={(opener) => onOpen(entry, opener)} />
        </li>
      ))}
    </ul>
  );
}

export function HourQualityList({ items, isToday }: HourQualityListProps): ReactElement {
  const [openEntry, setOpenEntry] = useState<HourEntry | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const nowIndex = isToday ? currentChiIndex() : null;
  const entries = items.map((item, index) => ({
    item,
    chiIndex: index,
    isNow: index === nowIndex,
  }));
  const hoangDao = entries.filter((entry) => entry.item.isHoangDao);
  const hacDao = entries.filter((entry) => !entry.item.isHoangDao);

  const openHour = (entry: HourEntry, opener: HTMLButtonElement): void => {
    openerRef.current = opener;
    setOpenEntry(entry);
  };

  const returnFocusToOpener = (event: Event): void => {
    event.preventDefault();
    openerRef.current?.focus();
  };

  return (
    <section className="rounded-2xl border border-ink/15 bg-day px-4 py-6 text-ink md:px-8 md:py-8">
      <div className="text-center">
        <DisplayTitle as="h2" size={DisplaySize.Card} face={TitleFace.Serif}>
          Giờ tốt xấu trong ngày
        </DisplayTitle>
        <p className="mt-2 text-sm text-ink-soft">Chọn giờ tốt để mọi việc hanh thông, thuận lợi</p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Chip>
          <span aria-hidden className="mr-2 size-2 rounded-full bg-gold" />
          {hoangDao.length} giờ Hoàng đạo
        </Chip>
        <Chip>
          <span aria-hidden className="mr-2 size-2 rounded-full bg-ink" />
          {hacDao.length} giờ Hắc đạo
        </Chip>
      </div>

      <GroupLabel text="Giờ Hoàng đạo" />
      <HourGrid entries={hoangDao} onOpen={openHour} />

      <GroupLabel text="Giờ Hắc đạo" />
      <HourGrid entries={hacDao} onOpen={openHour} />

      <p className="mt-8 flex items-start gap-3 rounded-xl bg-day-200 px-4 py-3">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-ink" />
        <span className="text-sm text-ink-soft">
          <span className="font-semibold text-ink">Lưu ý: </span>
          Giờ tốt xấu chỉ mang tính tham khảo. Hãy kết hợp với các yếu tố khác để có lựa chọn phù
          hợp nhất.
        </span>
      </p>

      <HourDetailDialog
        entry={openEntry}
        onClose={() => setOpenEntry(null)}
        onCloseAutoFocus={returnFocusToOpener}
      />
    </section>
  );
}
