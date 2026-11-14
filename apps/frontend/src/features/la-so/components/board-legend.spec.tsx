import { render, screen, within } from '@testing-library/react';
import type { NguHanh } from '@org/shared-tu-vi';
import { BoardLegend } from './board-legend';

interface ExpectedElement {
  readonly element: NguHanh;
  readonly iconSlug: string;
  readonly nightClass: string;
}

const EXPECTED_ELEMENTS: readonly ExpectedElement[] = [
  { element: 'Kim', iconSlug: 'kim', nightClass: 'text-hanh-kim-night' },
  { element: 'Mộc', iconSlug: 'moc', nightClass: 'text-hanh-moc-night' },
  { element: 'Thủy', iconSlug: 'thuy', nightClass: 'text-hanh-thuy-night' },
  { element: 'Hỏa', iconSlug: 'hoa', nightClass: 'text-hanh-hoa-night' },
  { element: 'Thổ', iconSlug: 'tho', nightClass: 'text-hanh-tho-night' },
];
const BRIGHTNESS_LABELS = ['M Miếu', 'V Vượng', 'Đ Đắc', 'B Bình', 'H Hãm'] as const;

function listItems(name: string): readonly HTMLElement[] {
  return within(screen.getByRole('list', { name })).getAllByRole('listitem');
}

describe('BoardLegend', () => {
  it('lists the five hành, each with its icon and night colour', () => {
    render(<BoardLegend />);
    const items = listItems('Ngũ hành');

    expect(items.map((item) => item.textContent)).toEqual(
      EXPECTED_ELEMENTS.map(({ element }) => element),
    );
    EXPECTED_ELEMENTS.forEach(({ iconSlug, nightClass }, position) => {
      expect(items[position].querySelector('img')?.getAttribute('src')).toContain(
        `/hanh-${iconSlug}-64.webp`,
      );
      expect(items[position].classList.contains(nightClass)).toBe(true);
    });
  });

  it('keeps the hành icons out of the accessibility tree and off the first paint', () => {
    const { container } = render(<BoardLegend />);
    const icons = [...container.querySelectorAll('img')];

    expect(icons).toHaveLength(EXPECTED_ELEMENTS.length);
    expect(icons.every((icon) => icon.getAttribute('alt') === '')).toBe(true);
    expect(icons.every((icon) => icon.getAttribute('loading') === 'lazy')).toBe(true);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  it('spells out the five brightness letters', () => {
    render(<BoardLegend />);

    expect(listItems('Độ sáng').map((item) => item.textContent)).toEqual([...BRIGHTNESS_LABELS]);
  });
});
