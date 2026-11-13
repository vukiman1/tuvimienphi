import { render } from '@testing-library/react';
import { HourDial } from './hour-dial';

const CHI_COUNT = 12;
const TY_INDEX = 0;
const NGO_INDEX = 6;
const CENTRE_TOLERANCE = 1e-6;

function pointCircles(container: HTMLElement): readonly SVGCircleElement[] {
  return [...container.querySelectorAll<SVGCircleElement>('circle:not([fill="none"])')];
}

function largestPoint(container: HTMLElement): SVGCircleElement {
  const [largest] = [...pointCircles(container)].sort(
    (a, b) => Number(b.getAttribute('r')) - Number(a.getAttribute('r')),
  );
  return largest;
}

describe('HourDial', () => {
  it('places Tý at the top of the dial and Ngọ at the bottom', () => {
    const ty = render(<HourDial chiIndex={TY_INDEX} />);
    const tyPoint = largestPoint(ty.container);

    expect(Number(tyPoint.getAttribute('cy'))).toBeLessThan(0);
    expect(Math.abs(Number(tyPoint.getAttribute('cx')))).toBeLessThan(CENTRE_TOLERANCE);

    ty.unmount();
    const ngo = render(<HourDial chiIndex={NGO_INDEX} />);

    expect(Number(largestPoint(ngo.container).getAttribute('cy'))).toBeGreaterThan(0);
  });

  it('lights exactly one of the twelve points', () => {
    const { container } = render(<HourDial chiIndex={3} />);
    const points = pointCircles(container);

    expect(points).toHaveLength(CHI_COUNT);
    expect(points.filter((point) => point.classList.contains('fill-gold'))).toHaveLength(1);
  });

  it('is hidden from assistive tech', () => {
    const { container } = render(<HourDial chiIndex={TY_INDEX} />);

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });
});
