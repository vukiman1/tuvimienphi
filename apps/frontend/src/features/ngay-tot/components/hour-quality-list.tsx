import { ChevronDown, Star } from 'lucide-react';
import { zodiacIconPath } from '@/lib/zodiac-icons';

const MAX_RATING = 5;
const HOURS_PER_CHI = 2;

function canChiIconPath(canChi: string, onWood: boolean): string | null {
  const parts = canChi.split(' ');
  return zodiacIconPath(parts[parts.length - 1], onWood ? 'gold' : 'default');
}

export interface HourQuality {
  readonly range: string;
  readonly canChi: string;
  readonly isHoangDao: boolean;
  readonly rating: number;
  readonly stars: string;
  readonly favorable: string;
  readonly unfavorable: string;
}

interface HourQualityListProps {
  readonly items: readonly HourQuality[];
  readonly isToday: boolean;
}

function currentChiIndex(): number {
  const hour = new Date().getHours();
  return Math.floor(((hour + 1) % 24) / HOURS_PER_CHI);
}

function StarRating({ rating, onWood }: { readonly rating: number; readonly onWood: boolean }) {
  return (
    <span
      aria-label={`${rating} trên ${MAX_RATING} sao`}
      className="flex items-center gap-0.5"
      role="img"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <Star
          key={index}
          className={`size-3 ${
            index < rating
              ? onWood
                ? 'fill-[#e8c987] text-[#e8c987]'
                : 'fill-[#c9a15c] text-[#c9a15c]'
              : onWood
                ? 'fill-black/30 text-black/30'
                : 'fill-black/15 text-black/15'
          }`}
        />
      ))}
    </span>
  );
}

function DetailRow({
  label,
  tone,
  text,
}: {
  readonly label: string;
  readonly tone: 'neutral' | 'good' | 'bad';
  readonly text: string;
}) {
  const toneClass =
    tone === 'good'
      ? 'bg-primary/15 text-primary'
      : tone === 'bad'
        ? 'bg-destructive/10 text-destructive'
        : 'bg-muted text-muted-foreground';

  return (
    <p className="text-sm leading-relaxed text-foreground">
      <span
        className={`mr-2 inline-block rounded px-1.5 py-0.5 align-middle text-[0.65rem] font-bold tracking-wide uppercase ${toneClass}`}
      >
        {label}
      </span>
      {text}
    </p>
  );
}

export function HourQualityList({ items, isToday }: HourQualityListProps) {
  const goodCount = items.filter((item) => item.isHoangDao).length;
  const nowIndex = isToday ? currentChiIndex() : null;

  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md md:p-4">
      <div className="flex items-center justify-center gap-3 py-1">
        <span className="h-px max-w-24 flex-1 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
        <p className="font-display text-lg font-bold whitespace-nowrap text-primary">
          Giờ Tốt Xấu Trong Ngày
        </p>
        <span className="h-px max-w-24 flex-1 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
      </div>

      <p className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#c9a15c]" />
          {goodCount} giờ Hoàng đạo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          {items.length - goodCount} giờ Hắc đạo
        </span>
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {items.map((item, index) => {
          const isNow = index === nowIndex;
          const onWood = !item.isHoangDao;

          return (
            <details
              key={item.range}
              className={`group h-fit rounded-xl ${isNow ? 'shadow-[0_0_0_2px_#c9a15c99]' : ''}`}
            >
              <summary
                className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl bg-[length:100%_100%] px-4 py-3 transition-[filter] hover:brightness-110 [&::-webkit-details-marker]:hidden"
                style={{
                  backgroundImage: `url(${onWood ? '/bar-wood.png' : '/bar-marble.png'})`,
                }}
              >
                <span
                  className={`w-[4.6rem] shrink-0 rounded-md border px-1 py-1 text-center text-xs font-bold ${
                    onWood
                      ? 'border-[#e5c886]/40 bg-[#f3ead6] text-[#3a2c1a]'
                      : 'border-[#b8894a]/50 bg-white/70 text-[#3a2c1a]'
                  }`}
                >
                  {item.range}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span
                    className={`flex items-center gap-1.5 leading-tight font-bold ${
                      onWood ? 'text-[#f0dfae]' : 'text-[#2b2117]'
                    }`}
                  >
                    <span className="whitespace-nowrap font-display text-base">{item.canChi}</span>
                    {isNow && (
                      <span className="shrink-0 rounded-full bg-gradient-to-br from-[#e8c987] to-[#b8894a] px-1.5 py-px text-[0.6rem] font-bold text-[#1a1a1c]">
                        Bây giờ
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-[0.65rem] font-semibold ${
                      onWood ? 'text-[#c9b083]' : 'text-[#8a6b32]'
                    }`}
                  >
                    {item.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}
                  </span>
                </span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5">
                  {canChiIconPath(item.canChi, onWood) && (
                    <img
                      alt=""
                      className="h-6 w-auto max-w-8 object-contain"
                      src={canChiIconPath(item.canChi, onWood) ?? undefined}
                    />
                  )}
                  <StarRating onWood={onWood} rating={item.rating} />
                  <ChevronDown
                    className={`size-4 transition-transform group-open:rotate-180 ${
                      onWood ? 'text-[#e5c886]/80' : 'text-[#8a6b32]'
                    }`}
                  />
                </span>
              </summary>
              <div className="mx-2 mb-1 flex flex-col gap-2 rounded-b-lg border border-t-0 border-[#c9a15c]/30 bg-card px-3 py-2.5">
                <DetailRow label="Tinh" tone="neutral" text={item.stars} />
                <DetailRow label="Nghi" tone="good" text={item.favorable} />
                <DetailRow label="Kỵ" tone="bad" text={item.unfavorable} />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
