import { render, screen } from '@testing-library/react';
import type { LuanGiaiArticle } from '@org/shared-contracts';
import { LuanGiaiArticleCard } from './luan-giai-article';

const BAI: LuanGiaiArticle = {
  eyebrow: 'Mệnh',
  title: 'Mệnh và tính cách',
  quote: 'Một câu dẫn.',
  subheading: 'Nữ tuổi Tuất – Mệnh và tính cách',
  paragraphs: ['Đoạn mở bài.', 'Đoạn một.', 'Đoạn hai.'],
  summary: 'Đoạn chốt.',
  closingLabel: 'Một lời dành cho bạn',
  closing: 'Lời cuối.',
};

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function doTre(text: string): string {
  return screen.getByText(text).style.animationDelay;
}

describe('LuanGiaiArticleCard', () => {
  it('hiện dần từng khối khi bài vừa được viết xong', () => {
    render(<LuanGiaiArticleCard article={BAI} isFresh order="02" />);

    expect(doTre('Đoạn một.')).not.toBe('');
    expect(Number.parseInt(doTre('Đoạn hai.'), 10)).toBeGreaterThan(
      Number.parseInt(doTre('Đoạn một.'), 10),
    );
  });

  it('hiện thẳng khi mở lại bài đã lưu, vì lúc đó không có gì đang được viết', () => {
    render(<LuanGiaiArticleCard article={BAI} order="02" />);

    expect(doTre('Đoạn một.')).toBe('');
    expect(doTre('Đoạn hai.')).toBe('');
  });

  it('sets the quote in the preloaded Playfair italic', () => {
    const { container } = render(<LuanGiaiArticleCard article={BAI} order="02" />);

    expect(classTokens(container.querySelector('blockquote'))).toEqual(
      expect.arrayContaining(['font-emphasis', 'italic', 'font-semibold']),
    );
  });

  it('reads body copy left-aligned', () => {
    const { container } = render(<LuanGiaiArticleCard article={BAI} order="02" />);

    for (const paragraph of container.querySelectorAll('p')) {
      expect(classTokens(paragraph)).not.toContain('text-justify');
    }
  });

  it('numbers the chapter in a Night disc', () => {
    render(<LuanGiaiArticleCard article={BAI} order="02" />);

    expect(classTokens(screen.getByText('02'))).toEqual(
      expect.arrayContaining(['bg-night', 'text-dawn']),
    );
  });

  it('ships no painting and no seal', () => {
    const { container } = render(
      <LuanGiaiArticleCard article={{ ...BAI, sourceCung: 'Mệnh' }} order="02" />,
    );

    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
