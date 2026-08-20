import { Moon } from 'lucide-react';
import { CornerBrackets } from '@/features/ngay-tot/components/corner-brackets';
import {
  convertSolarToLunar,
  getDayCanChi,
  getMonthCanChi,
  getSolarTerm,
  getYearCanChi,
} from '@/lib/lunar-calendar';

const WEEKDAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

const CARD_BACKGROUND = 'linear-gradient(150deg, #14212e 0%, #0d151d 55%, #10191f 100%)';

function CanChiColumn({ label, value }: { readonly label: string; readonly value: string }) {
  const [can, chi] = value.split(' ');
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <p className="text-[0.6rem] font-semibold tracking-[0.18em] text-[#a89b83] uppercase">
        {label}
      </p>
      <p className="font-display text-lg leading-none font-bold text-[#e8c987]">{can}</p>
      <p className="font-display text-lg leading-none font-semibold text-[#f3e6cd]">{chi}</p>
    </div>
  );
}

export function DayDetailCard({ date }: { readonly date: Date }) {
  const lunar = convertSolarToLunar(date);
  const lunarMonthLabel = lunar.isLeapMonth ? `${lunar.month} nhuận` : `${lunar.month}`;
  const isSpecialLunarDay = lunar.day === 1 || lunar.day === 15;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#c9a15c]/60 p-4 shadow-lg md:p-5"
      style={{ backgroundImage: CARD_BACKGROUND }}
    >
      <CornerBrackets />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 flex-col items-center justify-center text-center sm:w-44 sm:border-r sm:border-[#c9a15c]/30 sm:pr-4">
          <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-[#c9a15c] uppercase">
            Tháng {date.getMonth() + 1} năm {date.getFullYear()}
          </p>
          <p className="mt-1 font-display text-6xl leading-none font-bold text-[#e8c987] md:text-7xl">
            {date.getDate()}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-[#d8cdb8] uppercase">
            {WEEKDAY_NAMES[date.getDay()]}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="grid grid-cols-3 divide-x divide-[#c9a15c]/25 py-1">
            <CanChiColumn label="Năm" value={getYearCanChi(lunar.year)} />
            <CanChiColumn label="Tháng" value={getMonthCanChi(lunar)} />
            <CanChiColumn label="Ngày" value={getDayCanChi(date)} />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-[#c9a15c]/30 bg-white/5 px-4 py-3">
            <Moon aria-hidden className="size-5 shrink-0 text-[#e8c987]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#f3e6cd]">
                Âm lịch: ngày {lunar.day} tháng {lunarMonthLabel}
              </p>
              <p className="mt-0.5 text-xs text-[#a89b83]">Tiết {getSolarTerm(date)}</p>
            </div>
          </div>
        </div>
      </div>

      {isSpecialLunarDay && (
        <p className="relative mt-3 rounded-lg border border-[#c9a15c]/30 bg-[#c9a15c]/10 px-3 py-1.5 text-xs font-medium text-[#e8c987]">
          {lunar.day === 1 ? 'Ngày mùng 1 âm lịch' : 'Ngày rằm'} — ngày lễ quan trọng trong tháng
          âm.
        </p>
      )}
    </div>
  );
}
