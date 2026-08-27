import { useState } from 'react';
import { Star, User } from 'lucide-react';
import { MEDIA } from '@/config/media';
import { getYearCanChi } from '@/lib/lunar-calendar';
import { zodiacIconPath, type ZodiacChi } from '@/lib/zodiac-icons';
import type {
  VanHanAspect,
  VanHanBirthYearFortune,
  VanHanFortune,
} from '@/features/van-han/placeholder-data';
import {
  aspectTheme,
  ELEMENT_THEMES,
  elementOfMenh,
  HAN_BY_CHI,
  HERO_ILLUSTRATION_BY_CHI,
  RED_ICON_STYLE,
} from '@/features/van-han/van-han-theme';

const MAX_RATING = 5;
const COLLAPSED_POINT_COUNT = 3;

/** Một cột luận giải theo giới tính (👤 NAM / 👤 NỮ): nhãn có đĩa tròn + đoạn văn. */
function GenderColumn({
  label,
  disc,
  text,
  divider,
  content,
}: {
  readonly label: string;
  readonly disc: string;
  readonly text: string;
  readonly divider: string;
  readonly content: string;
}) {
  return (
    <div className={`flex-1 md:self-stretch md:border-l md:pl-5 ${divider}`}>
      <div className="flex items-center gap-2">
        <span className={`flex size-6 items-center justify-center rounded-full ${disc}`}>
          <User className="size-3.5" />
        </span>
        <span className={`text-sm font-bold tracking-wide uppercase ${text}`}>{label}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-foreground">{content}</p>
    </div>
  );
}

function BirthYearCard({ entry }: { readonly entry: VanHanBirthYearFortune }) {
  const element = elementOfMenh(entry.menh);
  const theme = ELEMENT_THEMES[element];

  return (
    <div className={`overflow-hidden rounded-2xl border shadow-sm ${theme.card}`}>
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-2 md:p-5">
        {/* Đồng xu ngũ hành + tên can-chi + năm sinh + pill ngũ hành */}
        <div className="flex items-center gap-4 md:w-60 md:shrink-0">
          <img
            alt={element}
            className="size-20 shrink-0 object-contain"
            src={theme.coin}
            title={entry.menh}
          />
          <div className="min-w-0">
            <p className={`font-display text-2xl leading-tight font-bold ${theme.title}`}>
              {entry.canChi}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">Sinh năm {entry.birthYear}</p>
            <span
              className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.pill}`}
            >
              {element}
            </span>
          </div>
        </div>

        <GenderColumn
          content={entry.male}
          disc={theme.namDisc}
          divider={theme.divider}
          label="Nam"
          text={theme.title}
        />
        <GenderColumn
          content={entry.female}
          disc="bg-rose-100 text-rose-500"
          divider={theme.divider}
          label="Nữ"
          text="text-rose-600"
        />
      </div>
    </div>
  );
}

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
              ? 'fill-[#e0a83a] text-[#e0a83a]'
              : 'fill-transparent text-muted-foreground/35'
          }`}
        />
      ))}
    </span>
  );
}

function AspectCard({ aspect }: { readonly aspect: VanHanAspect }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = aspectTheme(aspect.label);
  const hasMore = aspect.points.length > COLLAPSED_POINT_COUNT;
  const visiblePoints = isExpanded ? aspect.points : aspect.points.slice(0, COLLAPSED_POINT_COUNT);

  return (
    <div className="break-inside-avoid rounded-2xl border border-[#e2d3a6] bg-gradient-to-b from-[#fdfbf4] to-[#f7efdd] p-1.5 shadow-sm">
      {/* Khung kép: viền ngoài + đường viền trong mảnh. */}
      <div className="flex h-full flex-col rounded-xl border border-[#ece0c2] px-4 py-4">
        <div className="flex items-center gap-3">
          <img alt="" className="size-11 shrink-0 object-contain" src={theme.coin} />
          <p className={`font-display text-lg font-bold tracking-wide uppercase ${theme.label}`}>
            {aspect.label}
          </p>
          <span className="ml-auto">
            <AspectRating rating={aspect.rating} />
          </span>
        </div>

        <ul className="mt-3 flex flex-1 flex-col gap-2">
          {visiblePoints.map((point, index) => (
            <li key={index} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className={`shrink-0 font-bold ${theme.bullet}`}>»</span>
              {point}
            </li>
          ))}
        </ul>

        {hasMore && (
          <div className="mt-3 flex justify-end">
            <button
              className="rounded-full border border-[#d9c48f] px-3.5 py-1 text-xs font-semibold text-[#9a7b3a] transition-colors outline-none hover:bg-[#f3e8c9]/60 focus-visible:ring-2 focus-visible:ring-ring/60"
              onClick={() => setIsExpanded((current) => !current)}
              type="button"
            >
              {isExpanded ? 'Thu gọn' : 'Xem chi tiết ›'}
            </button>
          </div>
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

function SectionTitle({
  title,
  subtitle,
  align = 'center',
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly align?: 'center' | 'left';
}) {
  if (align === 'left') {
    return (
      <div className="flex items-center gap-2.5 pt-4 pb-3">
        <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
        <span className="text-[0.6rem] text-[#c9a15c]">◆</span>
        <p className="font-display text-lg font-bold whitespace-nowrap text-[#a8332a]">{title}</p>
        <span className="text-[0.6rem] text-[#c9a15c]">◆</span>
        <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
      </div>
    );
  }

  return (
    <div className="pt-5 pb-3">
      <div className="flex items-center justify-center gap-2.5">
        <span className="h-px max-w-16 flex-1 bg-gradient-to-r from-transparent to-[#c9a15c]/70" />
        <span className="text-xs text-[#c9a15c]">❖</span>
        <p className="font-display text-xl font-bold whitespace-nowrap text-[#a8332a]">{title}</p>
        <span className="text-xs text-[#c9a15c]">❖</span>
        <span className="h-px max-w-16 flex-1 bg-gradient-to-l from-transparent to-[#c9a15c]/70" />
      </div>
      {subtitle && <p className="mt-1.5 text-center text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function HeroCard({
  chi,
  currentYear,
  fortune,
}: {
  readonly chi: ZodiacChi;
  readonly currentYear: number;
  readonly fortune: VanHanFortune;
}) {
  const heroImage = HERO_ILLUSTRATION_BY_CHI[chi];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#c9a15c]/40 bg-gradient-to-b from-[#fdf9f0] to-[#faf3e4] p-4 shadow-md md:p-6">
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 h-28 opacity-20"
        src={MEDIA.vanHan.decorCloud}
      />

      <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        {/* Ảnh minh hoạ vẽ tay nếu có; nếu chưa thì khung tròn CSS + icon silhouette. */}
        {heroImage ? (
          <img
            alt={`Tuổi ${chi}`}
            className="size-48 shrink-0 object-contain sm:size-52"
            src={heroImage}
          />
        ) : (
          <div className="relative shrink-0">
            <div className="relative flex size-48 items-center justify-center overflow-hidden rounded-full border-2 border-[#c9a15c]/50 bg-gradient-to-b from-[#fdf6e6] to-[#f3e4c4] shadow-inner sm:size-52">
              {/* Vòng trong mảnh + nền mây mờ, mô phỏng khung tranh vẽ tay. */}
              <span className="absolute inset-2 rounded-full border border-[#c9a15c]/40" />
              <img
                alt=""
                aria-hidden
                className="pointer-events-none absolute -right-1 -bottom-2 h-20 opacity-25"
                src={MEDIA.vanHan.decorCloud}
              />
              <img
                alt={`Tuổi ${chi}`}
                className="relative h-28 w-auto max-w-32 object-contain drop-shadow"
                src={zodiacIconPath(chi) ?? undefined}
                style={RED_ICON_STYLE}
              />
            </div>
            <span className="absolute top-3 -left-1 flex flex-col items-center rounded-md bg-[#a8332a] px-1.5 py-1 font-display text-sm leading-tight font-bold text-[#f7e2b0] shadow">
              <span>{HAN_BY_CHI[chi]}</span>
              <span>年</span>
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="font-display text-3xl font-bold text-[#a8332a]">Tuổi {chi}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vận hạn năm {getYearCanChi(currentYear)} {currentYear}
          </p>
          <p className="text-sm text-muted-foreground">Sinh năm: {fortune.birthYears.join(', ')}</p>

          <SectionTitle align="left" title="Lưu Niên Vận Thế" />
          <div className="flex flex-col gap-2 text-left">
            {fortune.overview.map((paragraph, index) => (
              <p key={index} className="text-sm leading-relaxed text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VanHanDetail({ chi, currentYear, fortune }: VanHanDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <HeroCard chi={chi} currentYear={currentYear} fortune={fortune} />

      <section>
        <SectionTitle title="Vận Thế Luận Giải" />
        <div className="grid gap-3 md:grid-cols-2">
          {fortune.aspects.map((aspect) => (
            <AspectCard key={aspect.label} aspect={aspect} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          subtitle={`Khám phá vận hạn chi tiết theo từng năm sinh của tuổi ${chi}`}
          title="Vận Hạn Từng Tuổi"
        />
        <div className="flex flex-col gap-3">
          {fortune.byBirthYear.map((entry) => (
            <BirthYearCard key={entry.birthYear} entry={entry} />
          ))}
        </div>
      </section>

      <div className="mt-2 flex items-center justify-center gap-3 rounded-xl border border-[#e2d3a6] bg-[#fdfbf4]/60 px-4 py-3">
        <span className="text-lg text-[#d9a441]">❖</span>
        <p className="text-center text-xs text-muted-foreground">
          Nội dung đang là dữ liệu minh họa cho tuổi {chi} — luận giải theo từng con giáp sẽ được
          cập nhật.
        </p>
        <span className="text-lg text-[#d9a441]">❖</span>
      </div>
    </div>
  );
}

/** Loader phong thủy: la bàn (luopan) xoay chậm + quầng vàng, hiện khi đang luận giải/chuyển tuổi. */
export function VanHanDetailLoader() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[420px] flex-col items-center justify-center gap-5 py-16"
    >
      <div className="relative flex items-center justify-center">
        <span
          aria-hidden
          className="absolute size-32 animate-pulse rounded-full bg-[#d9a441]/20 blur-2xl"
        />
        <span
          aria-hidden
          className="absolute size-28 animate-spin rounded-full border border-[#c9a15c]/25 border-t-[#c9a15c]/80 [animation-duration:2.4s]"
        />
        <img
          alt=""
          aria-hidden
          className="relative size-24 animate-spin opacity-90 [animation-duration:9s]"
          src={MEDIA.laSo.luopan}
        />
      </div>
      <p className="font-display text-base font-semibold tracking-wide text-[#a8332a]">
        Đang luận giải vận hạn…
      </p>
      <span className="text-sm tracking-[0.4em] text-[#c9a15c]">❖ ❖ ❖</span>
    </div>
  );
}
