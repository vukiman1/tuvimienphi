import { ChartAnatomySection } from '@/features/home/components/chart-anatomy-section';
import { HeroSection } from '@/features/home/components/hero-section';
import { PerspectivesSection } from '@/features/home/components/perspectives-section';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <PerspectivesSection />
      <ChartAnatomySection />
    </main>
  );
}
