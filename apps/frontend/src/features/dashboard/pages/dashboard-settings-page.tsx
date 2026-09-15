import { ProfileCard } from '@/features/settings/profile-card';
import { SecurityCard } from '@/features/settings/security-card';
import { TwoFactorCard } from '@/features/settings/two-factor-card';
import { DashboardPageHeader } from '../components/dashboard-page-header';

export function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 md:p-10">
      <DashboardPageHeader
        title="Cài đặt"
        description="Quản lý thông tin tài khoản và bảo mật của bạn"
      />
      <div className="flex flex-col gap-6">
        <ProfileCard />
        <div className="grid gap-6 md:grid-cols-2">
          <SecurityCard />
          <TwoFactorCard />
        </div>
      </div>
    </div>
  );
}
