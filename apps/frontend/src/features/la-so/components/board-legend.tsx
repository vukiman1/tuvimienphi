import type { ReactElement } from 'react';
import type { NguHanh, Rating } from '@org/shared-tu-vi';
import { SAO_ON_NIGHT_CLASS } from '@/features/la-so/chart-colors';
import { RATING_LABEL } from '@/features/la-so/components/cung-panel.constants';
import { HanhIcon } from '@/features/la-so/components/hanh-icon';
import { cn } from '@/lib/utils';

const LEGEND_ELEMENTS: readonly NguHanh[] = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const LEGEND_RATINGS: readonly Rating[] = ['M', 'V', 'Đ', 'B', 'H'];

export function BoardLegend(): ReactElement {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 text-xs">
      <ul aria-label="Ngũ hành" className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {LEGEND_ELEMENTS.map((element) => (
          <li
            key={element}
            className={cn('flex items-center gap-1.5 font-semibold', SAO_ON_NIGHT_CLASS[element])}
          >
            <HanhIcon element={element} />
            {element}
          </li>
        ))}
      </ul>
      <ul
        aria-label="Độ sáng"
        className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-day-soft"
      >
        {LEGEND_RATINGS.map((rating) => (
          <li key={rating}>
            <span className="font-bold text-day">{rating}</span> {RATING_LABEL[rating]}
          </li>
        ))}
      </ul>
    </div>
  );
}
