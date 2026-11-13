import type { ReactElement } from 'react';
import { Moon } from 'lucide-react';
import {
  convertSolarToLunar,
  getDayCanChi,
  getMonthCanChi,
  getSolarTerm,
  getYearCanChi,
} from '@org/shared-tu-vi';
import { isMungMot, isSpecialLunarDay } from '@/features/ngay-tot/calendar-day';

const WEEKDAY_NAMES = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

function CanChiColumn({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): ReactElement {
  const [can, chi] = value.split(' ');
  return (
    <div className="flex flex-col items-center gap-1 px-2">
      <p className="text-2xs font-semibold tracking-widest text-day-soft uppercase">{label}</p>
      <p className="text-lg leading-none font-bold text-dawn">{can}</p>
      <p className="text-lg leading-none font-semibold text-day">{chi}</p>
    </div>
  );
}

export function DayDetailCard({ date }: { readonly date: Date }): ReactElement {
  const lunar = convertSolarToLunar(date);
  const lunarMonthLabel = lunar.isLeapMonth ? `${lunar.month} nhuận` : `${lunar.month}`;

  return (
    <div className="rounded-2xl bg-night p-4 text-day md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <div className="flex shrink-0 flex-col items-center justify-center text-center sm:w-44 sm:border-r sm:border-day/20 sm:pr-4">
          <p className="text-xs font-bold tracking-widest text-dawn uppercase">
            Tháng {date.getMonth() + 1} năm {date.getFullYear()}
          </p>
          <p className="mt-1 font-display text-6xl leading-none font-extrabold text-gold md:text-7xl">
            {date.getDate()}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-widest text-day-soft uppercase">
            {WEEKDAY_NAMES[date.getDay()]}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="grid grid-cols-3 divide-x divide-day/20 py-1">
            <CanChiColumn label="Năm" value={getYearCanChi(lunar.year)} />
            <CanChiColumn label="Tháng" value={getMonthCanChi(lunar)} />
            <CanChiColumn label="Ngày" value={getDayCanChi(date)} />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-day/20 px-4 py-3">
            <Moon aria-hidden className="size-5 shrink-0 text-dawn" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-day">
                Âm lịch: ngày {lunar.day} tháng {lunarMonthLabel}
              </p>
              <p className="mt-0.5 text-xs text-day-soft">Tiết {getSolarTerm(date)}</p>
            </div>
          </div>
        </div>
      </div>

      {isSpecialLunarDay(lunar.day) && (
        <p className="mt-3 rounded-lg border border-gold/40 px-3 py-1.5 text-xs font-semibold text-dawn">
          {isMungMot(lunar.day) ? 'Ngày mùng 1 âm lịch' : 'Ngày rằm'} — ngày lễ quan trọng trong
          tháng âm.
        </p>
      )}
    </div>
  );
}
