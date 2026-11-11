import { render, screen } from '@testing-library/react';
import { CHART_ANATOMY_SECTION } from '@/features/home/home-content';
import { ChartAnatomySection } from './chart-anatomy-section';

class NeverIntersectingObserver {
  observe(): void {
    return undefined;
  }

  unobserve(): void {
    return undefined;
  }

  disconnect(): void {
    return undefined;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('ChartAnatomySection', () => {
  const originalObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    globalThis.IntersectionObserver =
      NeverIntersectingObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
  });

  it('keeps every feature card visible in prerendered HTML until motion is ready', () => {
    render(<ChartAnatomySection />);

    for (const card of CHART_ANATOMY_SECTION.cards) {
      const classes = screen.getByText(card.title).closest('li')?.className.split(/\s+/) ?? [];
      expect(classes).not.toContain('opacity-0');
      expect(classes).toContain('motion-ready:opacity-0');
    }
  });
});
