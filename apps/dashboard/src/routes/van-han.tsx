import { createFileRoute } from '@tanstack/react-router';
import { parseYearParam, type VanHanSearch } from '@/features/admin/components/van-han-year-model';
import { VanHanPage } from '@/features/admin/pages/van-han-page';

export const Route = createFileRoute('/van-han')({
  validateSearch: (search: Record<string, unknown>): VanHanSearch => ({
    year: parseYearParam(search['year']),
  }),
  component: VanHanPage,
});
