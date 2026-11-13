import type { ReactElement } from 'react';
import { Check, X } from 'lucide-react';
import type { XuatHanhSlot } from '@/lib/gio-xuat-hanh';
import { cn } from '@/lib/utils';

interface XuatHanhHoursProps {
  readonly slots: readonly XuatHanhSlot[];
}

export function XuatHanhHours({ slots }: XuatHanhHoursProps): ReactElement {
  return (
    <div className="rounded-2xl border border-ink/15 bg-day p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="h-px flex-1 bg-ink/15" />
        <h2 className="font-emphasis text-2xl font-bold text-ink">Giờ Xuất Hành</h2>
        <span aria-hidden className="h-px flex-1 bg-ink/15" />
      </div>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <li
            className={cn(
              'flex flex-col gap-3 rounded-xl p-3',
              slot.isGood ? 'border-2 border-gold bg-day' : 'border border-ink/15 bg-day-200',
            )}
            key={slot.name}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold whitespace-nowrap text-ink uppercase">{slot.name}</p>
              {slot.hours.map((hour) => (
                <p className="text-xs leading-snug text-ink-soft" key={hour.chi}>
                  {hour.range}
                </p>
              ))}
            </div>

            <span
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold',
                slot.isGood ? 'bg-gold text-ink' : 'bg-ink text-day',
              )}
            >
              {slot.isGood ? (
                <Check aria-hidden className="size-3.5" />
              ) : (
                <X aria-hidden className="size-3.5" />
              )}
              {slot.isGood ? 'Giờ tốt' : 'Giờ xấu'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
