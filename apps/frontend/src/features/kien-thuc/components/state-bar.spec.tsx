import { render } from '@testing-library/react';
import { StateBar } from './state-bar';

describe('StateBar', () => {
  it('draws a gold bar at the start that assistive tech skips', () => {
    const { container } = render(<StateBar />);
    const bar = container.querySelector('span');

    expect(bar?.getAttribute('aria-hidden')).toBe('true');
    ['left-0', 'w-1', 'inset-ring-2', 'inset-ring-gold'].forEach((token) =>
      expect(bar?.className.split(' ')).toContain(token),
    );
  });
});
