import { Outlet, createFileRoute } from '@tanstack/react-router';
import { DashboardLayout } from '@/features/dashboard/components/dashboard-layout';

export const Route = createFileRoute('/dashboard')({
  component: DashboardRouteLayout,
});

function DashboardRouteLayout() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
