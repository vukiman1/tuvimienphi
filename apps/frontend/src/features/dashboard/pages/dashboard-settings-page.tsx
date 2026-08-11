import { Link } from '@tanstack/react-router';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/features/settings/profile-card';
import { SecurityCard } from '@/features/settings/security-card';
import { TwoFactorCard } from '@/features/settings/two-factor-card';
import { SessionsCard } from '@/features/settings/sessions-card';

export function DashboardSettingsPage() {
  return (
    <main className="min-h-screen bg-muted/40">
      <SiteHeader />

      <section className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-10">
        <p className="mb-1 text-xs font-extrabold tracking-wide uppercase text-primary">
          Dashboard
        </p>
        <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Settings</h1>

        <div className="mt-6 flex flex-col gap-4">
          <ProfileCard />
          <div className="grid gap-4 md:grid-cols-2">
            <SecurityCard />
            <TwoFactorCard />
          </div>
          <SessionsCard />
        </div>

        <div className="mt-6">
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
