import { render, screen } from '@testing-library/react';
import { Logo } from './Logo';
import { LogoMark } from './LogoMark';
import { LogoTone } from './logo-tone';

describe('Logo', () => {
  it('is announced once as the site name', () => {
    render(<Logo tone={LogoTone.OnDark} />);

    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('img', { name: 'Tử Vi Miễn Phí' })).toBeTruthy();
  });

  it('sets the wordmark in day on dark surfaces and in ink on light ones', () => {
    const { rerender } = render(<Logo tone={LogoTone.OnDark} />);
    expect(screen.getByRole('img').className).toContain('text-day');

    rerender(<Logo tone={LogoTone.OnLight} />);
    expect(screen.getByRole('img').className).toContain('text-ink');
  });
});

describe('LogoMark', () => {
  it('is decorative', () => {
    const { container } = render(<LogoMark />);
    const image = container.querySelector('img');

    expect(image?.getAttribute('alt')).toBe('');
    expect(image?.getAttribute('aria-hidden')).toBe('true');
  });

  it('offers a sharper file for high-density screens', () => {
    const { container } = render(<LogoMark />);

    expect(container.querySelector('img')?.getAttribute('srcset')).toContain('2x');
  });
});
