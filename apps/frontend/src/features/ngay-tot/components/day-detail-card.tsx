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

function CanChiColumn({ label, value }: { readonly label: string; readonly value: string }) {
  const [can, chi] = value.split(' ');
  return (
    <div className="flex flex-col items-center gap-0.5 py-2">
      <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm leading-tight font-bold text-primary">{can}</p>
      <p className="text-sm leading-tight font-semibold text-foreground">{chi}</p>
    </div>
  );
}

export function DayDetailCard({ date }: { readonly date: Date }) {
  const lunar = convertSolarToLunar(date);
  const lunarMonthLabel = lunar.isLeapMonth ? `${lunar.month} nhuận` : `${lunar.month}`;
  const isSpecialLunarDay = lunar.day === 1 || lunar.day === 15;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/bg-date-view.svg')] bg-cover bg-top"
      />
      <div className="relative flex flex-col items-stretch gap-3 sm:flex-row">
        <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-lg border border-[#c9a15c]/40 bg-gradient-to-b from-[#c9a15c]/15 to-[#c9a15c]/5 px-2 py-3 text-center sm:w-32">
          <p className="text-[0.65rem] font-bold tracking-wide text-muted-foreground uppercase">
            Tháng {date.getMonth() + 1} năm {date.getFullYear()}
          </p>
          <p className="mt-1 font-display text-6xl leading-none font-bold text-primary">
            {date.getDate()}
          </p>
          <p className="mt-1.5 text-xs font-semibold text-foreground">
            {WEEKDAY_NAMES[date.getDay()]}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="grid grid-cols-3 divide-x divide-[#c9a15c]/25 rounded-lg border border-[#c9a15c]/25">
            <CanChiColumn label="Năm" value={getYearCanChi(lunar.year)} />
            <CanChiColumn label="Tháng" value={getMonthCanChi(lunar)} />
            <CanChiColumn label="Ngày" value={getDayCanChi(date)} />
          </div>

          <div className="rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <p className="font-semibold text-foreground">
              Âm lịch: ngày {lunar.day} tháng {lunarMonthLabel}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">Tiết {getSolarTerm(date)}</p>
          </div>
        </div>
      </div>

      {isSpecialLunarDay && (
        <p className="relative mt-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          {lunar.day === 1 ? 'Ngày mùng 1 âm lịch' : 'Ngày rằm'} — ngày lễ quan trọng trong tháng
          âm.
        </p>
      )}
    </div>
  );
}
