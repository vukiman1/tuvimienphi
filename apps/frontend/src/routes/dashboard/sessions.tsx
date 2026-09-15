import { createFileRoute } from '@tanstack/react-router';
import { DashboardSessionsPage } from '@/features/dashboard/pages/dashboard-sessions-page';
import { requireAuth } from '@/features/auth/route-guards';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/dashboard/sessions')({
  beforeLoad: requireAuth,
  component: DashboardSessionsPage,
  head: () =>
    seo({
      title: 'Phiên đăng nhập',
      description: 'Quản lý các phiên đăng nhập.',
      path: '/dashboard/sessions',
      noindex: true,
    }),
});
