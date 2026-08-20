import { Check, X } from 'lucide-react';
import { xuatHanhIconUrl } from '@/config/media';
import type { XuatHanhSlot } from '@/lib/gio-xuat-hanh';

/** Maps a slot name to its icon file. Keyed by name because that is what the calculator returns. */
const ICON_SLUGS: Readonly<Record<string, string>> = {
  'Đại An': 'dai-an',
  'Lưu Niên': 'luu-nien',
  'Tốc Hỷ': 'toc-hy',
  'Xích Khẩu': 'xich-khau',
  'Tiểu Cát': 'tieu-cat',
  'Không Vong': 'khong-vong',
};

interface XuatHanhHoursProps {
  readonly slots: readonly XuatHanhSlot[];
}

function TitleRule() {
  return (
    <span aria-hidden className="flex flex-1 items-center gap-1.5">
      <span className="h-px flex-1 bg-[#c9a15c]/50" />
      <span className="size-1.5 rotate-45 bg-[#c9a15c]/70" />
    </span>
  );
}

export function XuatHanhHours({ slots }: XuatHanhHoursProps) {
  return (
    <div className="rounded-2xl border border-[#c9a15c]/35 bg-card p-4 shadow-md md:p-5">
      <div className="flex items-center gap-2.5">
        <TitleRule />
        <h2 className="font-display text-lg font-bold tracking-wide text-primary uppercase md:text-xl">
          Giờ Xuất Hành
        </h2>
        <span className="flex flex-1 flex-row-reverse items-center gap-1.5">
          <span aria-hidden className="h-px flex-1 bg-[#c9a15c]/50" />
          <span aria-hidden className="size-1.5 rotate-45 bg-[#c9a15c]/70" />
        </span>
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <li
            className={`flex flex-col gap-3 rounded-xl border p-3 ${
              slot.isGood ? 'border-[#cfe0c8] bg-[#f7fbf5]' : 'border-[#efd9d6] bg-[#fdf6f5]'
            }`}
            key={slot.name}
          >
            <div className="flex items-center gap-2.5">
              <img
                alt=""
                aria-hidden
                className="size-11 shrink-0 object-contain"
                loading="lazy"
                src={xuatHanhIconUrl(ICON_SLUGS[slot.name] ?? '')}
              />
              <div className="min-w-0">
                <p
                  className={`font-display text-sm font-bold whitespace-nowrap uppercase ${
                    slot.isGood ? 'text-[#3f7350]' : 'text-[#a9403a]'
                  }`}
                >
                  {slot.name}
                </p>
                {slot.hours.map((hour) => (
                  <p className="text-xs leading-snug text-muted-foreground" key={hour.chi}>
                    {hour.range}
                  </p>
                ))}
              </div>
            </div>

            <span
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold ${
                slot.isGood ? 'bg-[#e6f0e1] text-[#3f7350]' : 'bg-[#f8e5e3] text-[#a9403a]'
              }`}
            >
              {slot.isGood ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {slot.isGood ? 'Giờ tốt' : 'Giờ xấu'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
