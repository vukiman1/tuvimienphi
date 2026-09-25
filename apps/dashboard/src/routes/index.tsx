import { createFileRoute } from '@tanstack/react-router';
import { OverviewPage } from '@/features/admin/pages/overview-page';

export const Route = createFileRoute('/')({
  component: OverviewPage,
});
