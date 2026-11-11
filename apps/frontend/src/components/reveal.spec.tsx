import { render, screen } from '@testing-library/react';
import { Reveal } from './reveal';

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

describe('Reveal', () => {
  const originalObserver = globalThis.IntersectionObserver;

  beforeEach(() => {
    globalThis.IntersectionObserver =
      NeverIntersectingObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
  });

  it('keeps content visible in prerendered HTML until motion is ready', () => {
    render(<Reveal>Lá số của bạn có gì?</Reveal>);

    const classes = screen.getByText('Lá số của bạn có gì?').className.split(/\s+/);
    expect(classes).not.toContain('opacity-0');
    expect(classes).toContain('motion-ready:opacity-0');
  });
});
