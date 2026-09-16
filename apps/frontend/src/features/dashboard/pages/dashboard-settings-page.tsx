import { ProfileCard } from '@/features/settings/components/profile-card';
import { SecurityCard } from '@/features/settings/components/security-card';
import { TwoFactorCard } from '@/features/settings/components/two-factor-card';

export function DashboardSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <ProfileCard />
      <div className="grid gap-6 xl:grid-cols-2">
        <SecurityCard />
        <TwoFactorCard />
      </div>
    </div>
  );
}
