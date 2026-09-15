import { SessionsCard } from '@/features/settings/sessions-card';
import { DashboardPageHeader } from '../components/dashboard-page-header';

export function DashboardSessionsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <DashboardPageHeader
        title="Phiên đăng nhập"
        description="Xem và đăng xuất các thiết bị đang truy cập tài khoản của bạn"
      />
      <SessionsCard />
    </div>
  );
}
