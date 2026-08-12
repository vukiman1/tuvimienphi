import { useState } from 'react';
import { Flame, Gem, Leaf, Mountain, Star, Waves } from 'lucide-react';
import { getYearCanChi } from '@/lib/lunar-calendar';
import { zodiacIconPath, type ZodiacChi } from '@/lib/zodiac-icons';
import type {
  VanHanAspect,
  VanHanBirthYearFortune,
  VanHanFortune,
} from '@/features/van-han/placeholder-data';

const MAX_RATING = 5;
const COLLAPSED_POINT_COUNT = 3;

const ELEMENT_THEMES = {
  Kim: {
    icon: Gem,
    container: 'border-slate-300/70 bg-gradient-to-b from-slate-100 to-slate-50',
    title: 'text-slate-800',
    iconWrap: 'border-slate-400/50 text-slate-600',
    divider: 'border-slate-300/60 divide-slate-300/60',
    namPill: 'bg-white/70 text-slate-700',
  },
  Mộc: {
    icon: Leaf,
    container: 'border-green-300/70 bg-gradient-to-b from-green-50 to-emerald-50/40',
    title: 'text-green-900',
    iconWrap: 'border-green-500/40 text-green-700',
    divider: 'border-green-300/50 divide-green-300/50',
    namPill: 'bg-white/70 text-green-800',
  },
  Thủy: {
    icon: Waves,
    container: 'border-sky-300/70 bg-gradient-to-b from-sky-50 to-cyan-50/40',
    title: 'text-sky-900',
    iconWrap: 'border-sky-500/40 text-sky-700',
    divider: 'border-sky-300/50 divide-sky-300/50',
    namPill: 'bg-white/70 text-sky-800',
  },
  Hỏa: {
    icon: Flame,
    container: 'border-orange-300/70 bg-gradient-to-b from-orange-50 to-amber-50/50',
    title: 'text-orange-900',
    iconWrap: 'border-orange-500/40 text-orange-700',
    divider: 'border-orange-300/50 divide-orange-300/50',
    namPill: 'bg-white/70 text-orange-800',
  },
  Thổ: {
    icon: Mountain,
    container: 'border-amber-500/40 bg-gradient-to-b from-amber-100/80 to-yellow-50/60',
    title: 'text-amber-900',
    iconWrap: 'border-amber-600/40 text-amber-800',
    divider: 'border-amber-500/30 divide-amber-500/30',
    namPill: 'bg-white/70 text-amber-800',
  },
} as const;

type ElementName = keyof typeof ELEMENT_THEMES;

function elementOfMenh(menh: string): ElementName {
  const parts = menh.split(' ');
  const last = parts[parts.length - 1] as ElementName;
  return ELEMENT_THEMES[last] ? last : 'Thổ';
}

function BirthYearCard({ entry }: { readonly entry: VanHanBirthYearFortune }) {
  const element = elementOfMenh(entry.menh);
  const theme = ELEMENT_THEMES[element];
  const Icon = theme.icon;

  return (
    <div className={`overflow-hidden rounded-xl border shadow-sm ${theme.container}`}>
      <div className="flex flex-col sm:flex-row">
        <div className="flex items-center gap-2.5 px-3 py-2.5 sm:w-48 sm:shrink-0">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full border bg-white/50 ${theme.iconWrap}`}
            title={entry.menh}
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className={`font-display text-lg leading-tight font-bold ${theme.title}`}>
              {entry.canChi}
            </p>
            <p className="text-xs text-muted-foreground">
              Sinh năm {entry.birthYear} ({element})
            </p>
          </div>
        </div>

        <div
          className={`grid flex-1 border-t bg-white/50 sm:grid-cols-2 sm:divide-x sm:border-t-0 sm:border-l ${theme.divider}`}
        >
          <div className={`border-b px-3 py-2.5 sm:border-b-0 ${theme.divider}`}>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-bold tracking-wide uppercase ${theme.namPill}`}
            >
              Nam
            </span>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{entry.male}</p>
          </div>
          <div className="px-3 py-2.5">
            <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-bold tracking-wide text-rose-700 uppercase">
              Nữ
            </span>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{entry.female}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const ASPECT_ICONS = [
  '/icons/icon-tai-van.png',
  '/icons/icon-su-nghiep.png',
  '/icons/icon-suc-khoe.png',
  '/icons/icon-tinh-duyen.png',
] as const;

function AspectRating({ rating }: { readonly rating: number }) {
  return (
    <span
      aria-label={`${rating} trên ${MAX_RATING} sao`}
      className="flex items-center gap-0.5"
      role="img"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          className={`size-3.5 ${
            index < rating
              ? 'fill-[#c9a15c] text-[#c9a15c]'
              : 'fill-transparent text-muted-foreground/40'
          }`}
        />
      ))}
    </span>
  );
}

function AspectCard({
  aspect,
  iconSrc,
}: {
  readonly aspect: VanHanAspect;
  readonly iconSrc: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMore = aspect.points.length > COLLAPSED_POINT_COUNT;
  const visiblePoints = isExpanded ? aspect.points : aspect.points.slice(0, COLLAPSED_POINT_COUNT);

  return (
    <div className="relative mb-3 break-inside-avoid overflow-hidden rounded-lg border border-[#c9a15c]/30 bg-[#fdf9f0] px-3 py-2.5">
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-1 right-1 h-12 opacity-15"
        src="/icons/decor-cloud.png"
      />

      <p className="relative flex items-center gap-2 border-b border-[#c9a15c]/20 pb-2 text-sm font-bold tracking-wide text-primary uppercase">
        <img alt="" className="h-7 w-auto max-w-10 shrink-0 object-contain" src={iconSrc} />
        {aspect.label}
        <span className="ml-auto">
          <AspectRating rating={aspect.rating} />
        </span>
      </p>

      <ul className="relative mt-2 flex flex-col gap-1.5">
        {visiblePoints.map((point) => (
          <li key={point} className="flex gap-2 text-sm leading-relaxed text-foreground">
            <img
              alt=""
              aria-hidden
              className="mt-1.5 h-2.5 w-auto shrink-0"
              src="/icons/bullet-arrow.png"
            />
            {point}
          </li>
        ))}
      </ul>

      <div className="relative mt-2 flex justify-end">
        {hasMore && (
          <button
            className="text-xs font-semibold text-primary underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
            onClick={() => setIsExpanded((current) => !current)}
            type="button"
          >
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </div>
    </div>
  );
}

interface VanHanDetailProps {
  readonly chi: ZodiacChi;
  readonly currentYear: number;
  readonly fortune: VanHanFortune;
}

function SectionTitle({ title }: { readonly title: string }) {
  return (
    <div className="flex items-center justify-center gap-3 pt-4 pb-2">
      <span className="h-px max-w-20 flex-1 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
      <p className="font-display text-base font-bold whitespace-nowrap text-primary">{title}</p>
      <span className="h-px max-w-20 flex-1 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
    </div>
  );
}

export function VanHanDetail({ chi, currentYear, fortune }: VanHanDetailProps) {
  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md md:p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-[#c9a15c]/40 bg-gradient-to-b from-[#c9a15c]/15 to-[#c9a15c]/5">
          <img
            alt=""
            className="h-9 w-auto max-w-12 object-contain"
            src={zodiacIconPath(chi) ?? undefined}
          />
        </span>
        <div className="min-w-0">
          <p className="font-display text-xl font-bold text-primary">Tuổi {chi}</p>
          <p className="text-xs text-muted-foreground">
            Vận hạn năm {getYearCanChi(currentYear)} {currentYear} · Sinh năm:{' '}
            {fortune.birthYears.join(', ')}
          </p>
        </div>
      </div>

      <SectionTitle title="Lưu Niên Vận Thế" />
      <div className="flex flex-col gap-2">
        {fortune.overview.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-foreground">
            {paragraph}
          </p>
        ))}
      </div>

      <SectionTitle title="Vận Thế Luận Giải" />
      <div className="md:columns-2 md:gap-3">
        {fortune.aspects.map((aspect, index) => (
          <AspectCard
            key={aspect.label}
            aspect={aspect}
            iconSrc={ASPECT_ICONS[index % ASPECT_ICONS.length]}
          />
        ))}
      </div>

      <SectionTitle title="Vận Hạn Từng Tuổi" />
      <div className="flex flex-col gap-3">
        {fortune.byBirthYear.map((entry) => (
          <BirthYearCard key={entry.birthYear} entry={entry} />
        ))}
      </div>

      <p className="mt-4 rounded-lg bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
        Nội dung đang là dữ liệu minh họa cho tuổi Ngọ — luận giải theo từng con giáp sẽ được cập
        nhật.
      </p>
    </div>
  );
}
