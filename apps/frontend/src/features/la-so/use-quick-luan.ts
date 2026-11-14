import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CungName, QuickCungLuan } from '@org/shared-tu-vi';
import { birthKey, type BirthInput } from '@/features/la-so/birth-input';

export function useQuickLuan(
  birth: BirthInput,
  cung: CungName,
): UseQueryResult<QuickCungLuan | null> {
  return useQuery({
    queryKey: ['quick-luan', birthKey(birth), cung],
    queryFn: async () => (await import('./quick-luan')).quickLuanFor(birth, cung),
    staleTime: Infinity,
  });
}
