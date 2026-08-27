import { ChartAnatomySection } from '@/features/home/components/chart-anatomy-section';
import { HeroSection } from '@/features/home/components/hero-section';
import { UnderstandingSection } from '@/features/home/components/understanding-section';

export function HomePage() {
  return (
    <main>
      <HeroSection />
      <ChartAnatomySection />
      <UnderstandingSection />
    </main>
  );
}
