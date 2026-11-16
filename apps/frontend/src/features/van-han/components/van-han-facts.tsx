import type { ReactElement } from 'react';
import { getYearCanChi } from '@org/shared-tu-vi';
import type { ZodiacChi } from '@/lib/zodiac-icons';

interface VanHanFactsProps {
  readonly chi: ZodiacChi;
  readonly year: number;
  readonly birthYears: readonly number[];
}

function FactSeparator(): ReactElement {
  return (
    <span aria-hidden="true" className="hidden text-day-soft sm:inline">
      ·
    </span>
  );
}

export function VanHanFacts({ chi, year, birthYears }: VanHanFactsProps): ReactElement {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
      <p className="font-display font-extrabold text-dawn">{`Tuổi ${chi}`}</p>
      <FactSeparator />
      <p className="text-day-soft">{`Vận hạn năm ${getYearCanChi(year)} ${year}`}</p>
      <FactSeparator />
      <p className="text-day-soft">{`Sinh năm: ${birthYears.join(', ')}`}</p>
    </div>
  );
}
