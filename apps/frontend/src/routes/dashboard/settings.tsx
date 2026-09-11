import { createFileRoute } from '@tanstack/react-router';
import { DashboardSettingsPage } from '@/features/dashboard/pages/dashboard-settings-page';
import { requireAuth } from '@/features/auth/route-guards';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/dashboard/settings')({
  beforeLoad: requireAuth,
  component: DashboardSettingsPage,
  head: () =>
    seo({
      title: 'Cài đặt tài khoản',
      description: 'Cài đặt tài khoản.',
      path: '/dashboard/settings',
      noindex: true,
    }),
});
