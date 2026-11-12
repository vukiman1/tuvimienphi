import { render, screen } from '@testing-library/react';
import { GiantNumeral } from './GiantNumeral';
import { Orbit } from './Orbit';
import { pointsOnCircle } from './points-on-circle';

const PRECISION = 9;
const HEX_COLOUR = /#[0-9a-f]{3,8}/i;

describe('pointsOnCircle', () => {
  it('starts at the top and goes clockwise', () => {
    const points = pointsOnCircle(4, 10);
    const expected = [
      { x: 0, y: -10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
      { x: -10, y: 0 },
    ];

    expected.forEach((point, index) => {
      expect(points[index].x).toBeCloseTo(point.x, PRECISION);
      expect(points[index].y).toBeCloseTo(point.y, PRECISION);
    });
  });

  it('places every point on the circle', () => {
    const points = pointsOnCircle(12, 50);

    expect(points).toHaveLength(12);
    for (const { x, y } of points) {
      expect(Math.hypot(x, y)).toBeCloseTo(50, PRECISION);
    }
  });
});

describe('Orbit', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(<Orbit />);
    const svg = container.querySelector('svg');

    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
  });

  it('draws the requested rings and points', () => {
    const { container } = render(<Orbit rings={2} points={12} />);

    expect(container.querySelectorAll('ellipse[fill="none"]')).toHaveLength(2);
    expect(container.querySelectorAll('circle[fill="currentColor"]')).toHaveLength(12);
  });

  it('flattens its rings and points into an ellipse', () => {
    const { container } = render(<Orbit rings={1} points={4} verticalScale={0.5} />);
    const ring = container.querySelector('ellipse[fill="none"]');
    const pointYs = [...container.querySelectorAll('circle[fill="currentColor"]')].map((point) =>
      Number(point.getAttribute('cy')),
    );

    expect(Number(ring?.getAttribute('ry'))).toBeCloseTo(Number(ring?.getAttribute('rx')) / 2);
    expect(Math.min(...pointYs)).toBeCloseTo(-Number(ring?.getAttribute('ry')));
    expect(container.querySelector('svg')?.getAttribute('viewBox')).toBe('-50 -25 100 50');
  });

  it('draws its points at the requested size', () => {
    const { container } = render(<Orbit rings={1} points={3} pointRadius={0.5} />);

    for (const point of container.querySelectorAll('circle[fill="currentColor"]')) {
      expect(point.getAttribute('r')).toBe('0.5');
    }
  });

  it('takes its colour from the text colour only', () => {
    const { container } = render(<Orbit rings={3} points={12} />);

    for (const element of container.querySelectorAll('*')) {
      expect(element.getAttribute('fill') ?? '').not.toMatch(HEX_COLOUR);
      expect(element.getAttribute('stroke') ?? '').not.toMatch(HEX_COLOUR);
    }
  });
});

describe('GiantNumeral', () => {
  it('is announced by its label', () => {
    render(<GiantNumeral parts={['12', '·', '03', '·', '1995']} label="12 tháng 03 năm 1995" />);

    expect(screen.getByLabelText('12 tháng 03 năm 1995').textContent).toBe('12 · 03 · 1995');
  });
});
