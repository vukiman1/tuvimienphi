import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { MEDIA } from '@/config/media';
import { CornerBrackets } from '@/features/ngay-tot/components/corner-brackets';
import { HourDetailDialog } from '@/features/ngay-tot/components/hour-detail-dialog';
import { zodiacIconPath } from '@/lib/zodiac-icons';

const MAX_RATING = 5;
const HOURS_PER_CHI = 2;

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

/** The gold artwork is drawn for dark surfaces; on the cream card it disappears. */
function zodiacIcon(canChi: string, isDark: boolean): string | null {
  const parts = canChi.split(' ');
  return zodiacIconPath(parts[parts.length - 1], isDark ? 'gold' : 'default');
}

function currentChiIndex(): number {
  const hour = new Date().getHours();
  return Math.floor(((hour + 1) % 24) / HOURS_PER_CHI);
}

function StarRating({ rating, isDark }: { readonly rating: number; readonly isDark: boolean }) {
  return (
    <span
      aria-label={`${rating} trên ${MAX_RATING} sao`}
      className="flex items-center justify-center gap-0.5"
      role="img"
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <span
          aria-hidden
          className={`text-xs leading-none ${
            index < rating ? 'text-[#d9ab5c]' : isDark ? 'text-white/20' : 'text-black/15'
          }`}
          key={index}
        >
          ★
        </span>
      ))}
    </span>
  );
}

function GroupLabel({ isDark, text }: { readonly isDark: boolean; readonly text: string }) {
  return (
    <div className="mt-10 flex items-center gap-3">
      <span aria-hidden className="h-px flex-1 bg-[#c9a15c]/40" />

      <span
        className="relative flex aspect-[550/139] w-[230px] shrink-0 items-center justify-center bg-[length:100%_100%] bg-no-repeat sm:w-[280px]"
        style={{
          backgroundImage: `url(${isDark ? MEDIA.ngayTot.labelPlateDark : MEDIA.ngayTot.labelPlateLight})`,
        }}
      >
        <img
          alt=""
          aria-hidden
          className="absolute -left-4 size-10 sm:-left-5 sm:size-12"
          src={isDark ? MEDIA.ngayTot.labelIconMoon : MEDIA.ngayTot.labelIconSun}
        />
        <span
          className={`pl-6 font-display text-xs font-bold tracking-[0.14em] uppercase sm:text-sm ${
            isDark ? 'text-[#e8c987]' : 'text-primary'
          }`}
        >
          {text}
        </span>
      </span>

      <span aria-hidden className="h-px flex-1 bg-[#c9a15c]/40" />
    </div>
  );
}

function HourCard({
  item,
  isNow,
  onOpen,
}: {
  readonly item: HourQuality;
  readonly isNow: boolean;
  readonly onOpen: () => void;
}) {
  const isDark = !item.isHoangDao;
  const iconSrc = zodiacIcon(item.canChi, isDark);

  return (
    <button
      className="relative block w-full min-w-0 cursor-pointer transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100"
      onClick={onOpen}
      type="button"
    >
      <CornerBrackets className={isDark ? 'text-[#c9a15c]/50' : 'text-[#c9a15c]/40'} />

      <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-md bg-gradient-to-b from-[#e8c987] to-[#b8894a] px-3 py-1 text-xs font-bold whitespace-nowrap text-[#2a1f0e] shadow-sm">
        {item.range}
      </span>

      <span
        className={`flex flex-col items-center gap-2 rounded-xl border px-2 pt-5 pb-3 shadow-sm ${
          isDark ? 'border-[#c9a15c]/40 bg-[#2b2521]' : 'border-[#c9a15c]/35 bg-[#fdfaf3]'
        }`}
      >
        <span
          className={`flex size-14 items-center justify-center rounded-full border ${
            isDark ? 'border-[#c9a15c]/40 bg-white/5' : 'border-[#c9a15c]/30 bg-[#f7efdd]'
          }`}
        >
          {iconSrc && <img alt="" aria-hidden className="size-9 object-contain" src={iconSrc} />}
        </span>

        <span
          className={`font-display text-base font-bold ${isDark ? 'text-[#f3e6cd]' : 'text-foreground'}`}
        >
          {item.canChi}
        </span>

        {isNow ? (
          <span className="rounded-full bg-gradient-to-br from-[#e8c987] to-[#b8894a] px-2 py-0.5 text-[0.65rem] font-bold text-[#2a1f0e]">
            Bây giờ
          </span>
        ) : (
          <span className={`text-xs ${isDark ? 'text-[#a89b83]' : 'text-muted-foreground'}`}>
            {item.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'}
          </span>
        )}

        <StarRating isDark={isDark} rating={item.rating} />

        <ChevronDown
          aria-hidden
          className={`size-5 rounded-full border p-0.5 ${
            isDark ? 'border-[#c9a15c]/40 text-[#e8c987]' : 'border-[#c9a15c]/40 text-primary'
          }`}
        />
      </span>
    </button>
  );
}

export function HourQualityList({ items, isToday }: HourQualityListProps) {
  const [openHour, setOpenHour] = useState<HourQuality | null>(null);
  const nowIndex = isToday ? currentChiIndex() : null;
  const withIndex = items.map((item, index) => ({ item, isNow: index === nowIndex }));
  const hoangDao = withIndex.filter((entry) => entry.item.isHoangDao);
  const hacDao = withIndex.filter((entry) => !entry.item.isHoangDao);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#c9a15c]/35 bg-card px-4 py-6 shadow-md md:px-8 md:py-8">
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-2 left-0 w-[270px] opacity-45 select-none md:w-[450px]"
        loading="lazy"
        src={MEDIA.ngayTot.decorPine}
      />

      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 w-[200px] opacity-45 select-none md:w-[340px]"
        loading="lazy"
        src={MEDIA.ngayTot.decorCrane}
      />

      <div className="relative">
        <h2 className="text-center font-display text-2xl font-bold tracking-wide text-primary uppercase md:text-3xl">
          Giờ tốt xấu trong ngày
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Chọn giờ tốt để mọi việc hanh thông, thuận lợi
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[#c9a15c]/40 bg-[#fdf3e0] px-4 py-2 text-sm font-medium text-primary">
            <span aria-hidden className="size-2 rounded-full bg-[#c9a15c]" />
            {hoangDao.length} giờ Hoàng đạo
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground">
            <span aria-hidden className="size-2 rounded-full bg-muted-foreground/50" />
            {hacDao.length} giờ Hắc đạo
          </span>
        </div>

        <GroupLabel isDark={false} text="Giờ Hoàng đạo" />
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {hoangDao.map((entry) => (
            <li className="min-w-0" key={entry.item.range}>
              <HourCard
                isNow={entry.isNow}
                item={entry.item}
                onOpen={() => setOpenHour(entry.item)}
              />
            </li>
          ))}
        </ul>

        <GroupLabel isDark text="Giờ Hắc đạo" />
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {hacDao.map((entry) => (
            <li className="min-w-0" key={entry.item.range}>
              <HourCard
                isNow={entry.isNow}
                item={entry.item}
                onOpen={() => setOpenHour(entry.item)}
              />
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-start gap-3 rounded-xl border border-[#c9a15c]/30 bg-[#fdf3e0]/60 px-4 py-3">
          <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Lưu ý: </span>
            Giờ tốt xấu chỉ mang tính tham khảo. Hãy kết hợp với các yếu tố khác để có lựa chọn phù
            hợp nhất.
          </span>
        </p>
      </div>

      <HourDetailDialog hour={openHour} onClose={() => setOpenHour(null)} />
    </section>
  );
}
