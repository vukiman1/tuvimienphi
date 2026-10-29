import { convertSolarToLunar, getYearPillar, type CanChiIndex } from './lich/lunar-calendar.js';
import { anTuHoa, type TuHoa } from './tu-hoa.js';

const AFTER_TET_MONTH_INDEX = 6;

export function viewYearPillar(viewYear: number): CanChiIndex {
  return getYearPillar(convertSolarToLunar(new Date(viewYear, AFTER_TET_MONTH_INDEX, 1)).year);
}

export function anTuHoaLuuNien(viewYear: number): readonly TuHoa[] {
  return anTuHoa(viewYearPillar(viewYear).can);
}
