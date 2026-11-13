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

  it('offers 64, 128 and 256 px files so each place picks the smallest that stays sharp', () => {
    const { container } = render(<LogoMark />);

    expect(container.querySelector('img')?.getAttribute('srcset')).toBe(
      '/brand/logo-mark-64.webp 64w, /brand/logo-mark-128.webp 128w, /brand/logo-mark-256.webp 256w',
    );
  });
});

describe('Logo mark size hint', () => {
  it('asks for a small file next to the wordmark', () => {
    const { container } = render(<Logo tone={LogoTone.OnDark} />);

    expect(container.querySelector('img')?.getAttribute('sizes')).toBe('2rem');
  });

  it('asks for a file as large as the mark where no size is given', () => {
    const { container } = render(<LogoMark />);

    expect(container.querySelector('img')?.getAttribute('sizes')).toBe('4rem');
  });
});
