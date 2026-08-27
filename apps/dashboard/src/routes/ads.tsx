import { createFileRoute } from '@tanstack/react-router';
import { AdsPage } from '@/features/admin/pages/ads-page';
import { adminQueries } from '@/features/admin/data/queries';

export const Route = createFileRoute('/ads')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.ads()),
  component: AdsPage,
});
