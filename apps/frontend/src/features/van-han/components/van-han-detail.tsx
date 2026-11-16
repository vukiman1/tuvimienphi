import { useState, type ReactElement, type ReactNode } from 'react';
import { User } from 'lucide-react';
import {
  DisplaySize,
  DisplayTitle,
  FOCUS_RING_CLASS,
  ReadingZone,
  StarRating,
  TitleFace,
} from '@/design-system';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { cn } from '@/lib/utils';
import type {
  VanHanAspect,
  VanHanBirthYearFortune,
  VanHanFortune,
} from '@/features/van-han/map-van-han';
import { elementOfMenh } from '@/features/van-han/menh-element';

const COLLAPSED_POINT_COUNT = 3;
const EXPAND_LABEL = 'Xem chi tiết ›';
const COLLAPSE_LABEL = 'Thu gọn';
const CARD_CLASS = 'flex flex-col rounded-2xl border border-ink/15 bg-day p-5';
const TOGGLE_CLASS =
  'inline-flex min-h-11 items-center rounded-full border border-ink-soft px-4 text-sm font-semibold text-ink hover:border-ink';

interface SectionTitleProps {
  readonly children: ReactNode;
}

function SectionTitle({ children }: SectionTitleProps): ReactElement {
  return (
    <DisplayTitle face={TitleFace.Serif} size={DisplaySize.Card}>
      {children}
    </DisplayTitle>
  );
}

interface GenderColumnProps {
  readonly label: string;
  readonly reading: string;
}

function GenderColumn({ label, reading }: GenderColumnProps): ReactElement {
  return (
    <div className="flex flex-1 flex-col gap-2 md:border-l md:border-ink/15 md:pl-5">
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-6 items-center justify-center rounded-full bg-ink text-day"
        >
          <User className="size-3.5" />
        </span>
        <span className="text-sm font-bold text-ink">{label}</span>
      </div>
      <p className="text-base leading-relaxed text-ink">{reading}</p>
    </div>
  );
}

interface BirthYearCardProps {
  readonly entry: VanHanBirthYearFortune;
}

function BirthYearCard({ entry }: BirthYearCardProps): ReactElement {
  return (
    <article className={cn(CARD_CLASS, 'gap-4 md:flex-row md:gap-6')}>
      <div className="flex flex-col items-start gap-1 md:w-60 md:shrink-0">
        <p className="font-display text-2xl font-extrabold text-ink">{entry.canChi}</p>
        <p className="text-sm text-ink-soft">{`Sinh năm ${entry.birthYear}`}</p>
        <span className="rounded-full bg-day-200 px-2.5 py-0.5 text-xs font-semibold text-ink">
          {elementOfMenh(entry.menh)}
        </span>
      </div>
      <GenderColumn label="Nam" reading={entry.male} />
      <GenderColumn label="Nữ" reading={entry.female} />
    </article>
  );
}

interface AspectCardProps {
  readonly aspect: VanHanAspect;
}

function AspectCard({ aspect }: AspectCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMore = aspect.points.length > COLLAPSED_POINT_COUNT;
  const visiblePoints = isExpanded ? aspect.points : aspect.points.slice(0, COLLAPSED_POINT_COUNT);

  return (
    <article className={cn(CARD_CLASS, 'gap-3')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl font-extrabold text-ink">{aspect.label}</h3>
        <StarRating rating={aspect.rating} />
      </div>
      <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-ink-soft">
        {visiblePoints.map((point, index) => (
          <li key={index} className="text-base leading-relaxed text-ink">
            {point}
          </li>
        ))}
      </ul>
      {hasMore && (
        <div className="flex justify-end">
          <button
            aria-expanded={isExpanded}
            className={cn(TOGGLE_CLASS, FOCUS_RING_CLASS)}
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            {isExpanded ? COLLAPSE_LABEL : EXPAND_LABEL}
          </button>
        </div>
      )}
    </article>
  );
}

interface VanHanDetailProps {
  readonly chi: ZodiacChi;
  readonly fortune: VanHanFortune;
}

export function VanHanDetail({ chi, fortune }: VanHanDetailProps): ReactElement {
  return (
    <div className="flex flex-col gap-12 text-ink">
      <section>
        <ReadingZone>
          <div className="flex flex-col gap-4">
            <SectionTitle>Lưu Niên Vận Thế</SectionTitle>
            {fortune.overview.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </ReadingZone>
      </section>

      <section className="flex flex-col gap-6">
        <SectionTitle>Vận Thế Luận Giải</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          {fortune.aspects.map((aspect) => (
            <AspectCard key={aspect.label} aspect={aspect} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <SectionTitle>Vận Hạn Từng Tuổi</SectionTitle>
          <p className="text-base text-ink-soft">
            {`Khám phá vận hạn chi tiết theo từng năm sinh của tuổi ${chi}`}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {fortune.byBirthYear.map((entry) => (
            <BirthYearCard key={entry.birthYear} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}

interface VanHanDetailEmptyProps {
  readonly chi: ZodiacChi;
}

export function VanHanDetailEmpty({ chi }: VanHanDetailEmptyProps): ReactElement {
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl bg-day-200 px-4 py-12">
      <p className="font-emphasis text-2xl font-bold text-ink">{`Tuổi ${chi}`}</p>
      <p className="text-center text-base text-ink">
        {`Vận hạn của tuổi ${chi} chưa được cập nhật. Vui lòng quay lại sau.`}
      </p>
    </div>
  );
}
