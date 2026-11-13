import { render } from '@testing-library/react';
import { LaSoBoardIcon } from './LaSoBoardIcon';

describe('LaSoBoardIcon', () => {
  it('is a decorative line drawing in the current text colour', () => {
    const { container } = render(<LaSoBoardIcon />);
    const icon = container.querySelector('svg');

    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(icon?.getAttribute('stroke')).toBe('currentColor');
  });

  it('takes its size from the caller', () => {
    const { container } = render(<LaSoBoardIcon className="size-6" />);

    expect(container.querySelector('svg')?.getAttribute('class')).toContain('size-6');
  });
});
