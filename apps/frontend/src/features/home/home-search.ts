import { z } from 'zod';
import { Gender, MAX_VIEW_YEAR, MIN_VIEW_YEAR } from '@/features/la-so/birth-input';

const homeSearchSchema = z.object({
  gender: z.enum(Gender).optional().catch(undefined),
  viewYear: z.number().int().min(MIN_VIEW_YEAR).max(MAX_VIEW_YEAR).optional().catch(undefined),
});

export type HomeSearch = z.infer<typeof homeSearchSchema>;

export function validateHomeSearch(search: Record<string, unknown>): HomeSearch {
  return homeSearchSchema.parse(search);
}
