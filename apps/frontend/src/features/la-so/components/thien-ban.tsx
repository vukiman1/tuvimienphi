import { CHART_RULE_CLASS, CUNG_SURFACE_CLASS } from '@/features/la-so/chart-colors';
import type { ChartMeta } from '@/features/la-so/chart-types';

interface ThienBanProps {
  readonly meta: ChartMeta;
}

function Row({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex gap-2 text-[13px] leading-[21px]">
      <span className="w-[94px] shrink-0 font-semibold whitespace-nowrap text-[#5b5347]">
        {label}
      </span>
      <span className="min-w-0 font-medium text-[#17150f]">{value}</span>
    </div>
  );
}

export function ThienBan({ meta }: ThienBanProps) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center gap-2 border px-3 py-2 ${CHART_RULE_CLASS.border} ${CUNG_SURFACE_CLASS.base}`}
    >
      <p className="font-display text-[20px] leading-[26px] font-bold text-[#8a2b22]">
        Lá Số Tử Vi
      </p>

      <div className="flex w-full max-w-[352px] flex-col">
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
