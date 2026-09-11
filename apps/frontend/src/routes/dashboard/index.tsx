import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { requireAuth } from '@/features/auth/route-guards';
import { userQueries } from '@/services/user-service';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: requireAuth,
  loader: ({ context }) => context.queryClient.ensureQueryData(userQueries.credit()),
  component: DashboardPage,
  head: () =>
    seo({
      title: 'Tài khoản',
      description: 'Trang quản lý tài khoản.',
      path: '/dashboard',
      noindex: true,
    }),
});
