import { createFileRoute } from '@tanstack/react-router';
import { VanHanPage } from '@/features/admin/pages/van-han-page';
import { adminQueries } from '@/features/admin/data/queries';

export const Route = createFileRoute('/van-han')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.vanHan()),
  component: VanHanPage,
});
