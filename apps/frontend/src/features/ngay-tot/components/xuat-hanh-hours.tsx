import { Check, X } from 'lucide-react';
import type { XuatHanhSlot } from '@/lib/gio-xuat-hanh';

interface XuatHanhHoursProps {
  readonly slots: readonly XuatHanhSlot[];
}

export function XuatHanhHours({ slots }: XuatHanhHoursProps) {
  return (
    <div className="rounded-xl border border-[#c9a15c]/40 bg-card p-3 shadow-md">
      <p className="py-1 text-center font-display text-lg font-bold text-primary">Giờ Xuất Hành</p>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((slot) => (
          <div
            key={slot.name}
            className={`flex flex-col overflow-hidden rounded-lg border text-center ${
              slot.isGood
                ? 'border-[#c9a15c]/60 bg-gradient-to-b from-[#c9a15c]/15 to-transparent'
                : 'border-border bg-muted/30'
            }`}
          >
            <p
              className={`px-1 py-1.5 text-xs font-bold tracking-wide uppercase ${
                slot.isGood
                  ? 'bg-gradient-to-br from-[#e8c987] to-[#b8894a] text-[#1a1a1c]'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {slot.name}
            </p>

            <div className="flex flex-1 flex-col justify-center gap-1 px-1 py-2">
              {slot.hours.map((hour) => (
                <p key={hour.chi} className="leading-tight">
                  <span
                    className={`text-base font-bold ${
                      slot.isGood ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {hour.chi}
                  </span>{' '}
                  <span className="text-xs text-muted-foreground">{hour.range}</span>
                </p>
              ))}
            </div>

            <div className="flex justify-center pb-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                  slot.isGood ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                }`}
              >
                {slot.isGood ? <Check className="size-3" /> : <X className="size-3" />}
                {slot.isGood ? 'Giờ tốt' : 'Giờ xấu'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
