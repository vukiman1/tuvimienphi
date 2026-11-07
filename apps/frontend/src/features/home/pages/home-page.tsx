import type { Gender } from '@/features/la-so/birth-input';
import { ChartAnatomySection } from '@/features/home/components/chart-anatomy-section';
import { HeroSection } from '@/features/home/components/hero-section';
import { KnowledgeSection } from '@/features/home/components/knowledge-section';
import { UnderstandingSection } from '@/features/home/components/understanding-section';

interface HomePageProps {
  readonly initialGender?: Gender;
  readonly viewYear?: number;
}

export function HomePage({ initialGender, viewYear }: HomePageProps = {}) {
  return (
    <main>
      <HeroSection initialGender={initialGender} viewYear={viewYear} />
      <ChartAnatomySection />
      <UnderstandingSection />
      <KnowledgeSection />
    </main>
  );
}
