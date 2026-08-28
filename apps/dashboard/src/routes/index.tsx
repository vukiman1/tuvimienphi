import { createFileRoute } from '@tanstack/react-router';
import { OverviewPage } from '@/features/admin/pages/overview-page';
import { adminQueries } from '@/features/admin/data/queries';

export const Route = createFileRoute('/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.overview()),
  component: OverviewPage,
});
