import type { ReactElement } from 'react';
import { CHART_RULE_CLASS, CUNG_SURFACE_CLASS } from '@/features/la-so/chart-colors';
import type { ChartMeta } from '@/features/la-so/chart-types';
import { cn } from '@/lib/utils';

const WORD_ABOVE_LINES_CLASS = 'relative z-20 bg-night';

interface ThienBanProps {
  readonly meta: ChartMeta;
}

function Row({ label, value }: { readonly label: string; readonly value: string }): ReactElement {
  return (
    <div className="flex gap-2 text-xs leading-5">
      <span className="w-24 shrink-0">
        <span
          className={cn('font-semibold whitespace-nowrap text-day-soft', WORD_ABOVE_LINES_CLASS)}
        >
          {label}
        </span>
      </span>
      <span className={cn('min-w-0 text-day', WORD_ABOVE_LINES_CLASS)}>{value}</span>
    </div>
  );
}

export function ThienBan({ meta }: ThienBanProps): ReactElement {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center gap-2 border px-3 py-2',
        CHART_RULE_CLASS.border,
        CUNG_SURFACE_CLASS.base,
      )}
    >
      <p className={cn('text-xl leading-7 font-bold text-dawn', WORD_ABOVE_LINES_CLASS)}>
        Lá Số Tử Vi
      </p>

      <div className="flex w-full max-w-80 flex-col">
        <Row label="Họ tên:" value={meta.fullName} />
        <Row label="Năm:" value={`${meta.solarYear} · ${meta.lunarYear}`} />
        <Row label="Tháng:" value={`${meta.solarMonth} · ${meta.lunarMonth}`} />
        <Row label="Ngày:" value={`${meta.solarDay} · ${meta.lunarDay}`} />
        <Row label="Giờ:" value={`${meta.solarHour} · ${meta.lunarHour}`} />
        <Row label="Năm xem:" value={meta.viewYear} />
        <Row label="Âm dương:" value={meta.amDuong} />
        <Row label="Bản mệnh:" value={meta.banMenh} />
        <Row label="Cân lượng:" value={meta.canLuong} />
        <Row label="Chủ mệnh:" value={meta.chuMenh} />
        <Row label="Chủ thân:" value={meta.chuThan} />
        <Row label="Lai nhân cung:" value={meta.laiNhanCung} />
      </div>
    </div>
  );
}
