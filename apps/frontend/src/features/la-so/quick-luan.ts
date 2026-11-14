import {
  chartFromBirthInput,
  quickCungLuan,
  type CungName,
  type QuickCungLuan,
} from '@org/shared-tu-vi';
import type { BirthInput } from '@/features/la-so/birth-input';

export function quickLuanFor(birth: BirthInput, cung: CungName): QuickCungLuan | null {
  return quickCungLuan(chartFromBirthInput(birth).chart, cung);
}
