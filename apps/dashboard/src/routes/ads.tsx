import { createFileRoute } from '@tanstack/react-router';
import { AdsPage } from '@/features/admin/pages/ads-page';

export const Route = createFileRoute('/ads')({
  component: AdsPage,
});
