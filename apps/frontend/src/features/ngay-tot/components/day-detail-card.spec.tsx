import { render, screen } from '@testing-library/react';
import { convertSolarToLunar, getDayCanChi } from '@org/shared-tu-vi';
import { DayDetailCard } from './day-detail-card';

const DATE = new Date(2026, 7, 11);
const SEARCH_DAYS = 31;
const MUNG_MOT_NOTE = /Ngày mùng 1 âm lịch — ngày lễ quan trọng trong tháng/;

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function firstMungMotAfter(date: Date): Date {
  for (let offset = 1; offset <= SEARCH_DAYS; offset += 1) {
    const candidate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
    if (convertSolarToLunar(candidate).day === 1) return candidate;
  }
  throw new Error(`no mùng 1 within ${SEARCH_DAYS} days after ${date.toDateString()}`);
}

describe('DayDetailCard', () => {
  it('shows the day on a Night panel without a gradient', () => {
    const { container } = render(<DayDetailCard date={DATE} />);
    const root = container.firstElementChild;

    expect(classTokens(root)).toEqual(expect.arrayContaining(['bg-night', 'text-day']));
    expect(root?.getAttribute('style') ?? '').not.toContain('background-image');
  });

  it('sets the day numeral in the preloaded Inter Tight 800', () => {
    render(<DayDetailCard date={DATE} />);

    expect(classTokens(screen.getByText('11'))).toEqual(
      expect.arrayContaining(['font-display', 'font-extrabold', 'text-gold']),
    );
  });

  it('keeps the năm, tháng and ngày can chi', () => {
    render(<DayDetailCard date={DATE} />);
    const [dayCan] = getDayCanChi(DATE).split(' ');

    for (const label of ['Năm', 'Tháng', 'Ngày']) {
      expect(classTokens(screen.getByText(label))).toContain('text-day-soft');
    }
    const canCells = screen.getAllByText(dayCan);
    expect(canCells.some((cell) => classTokens(cell).includes('text-dawn'))).toBe(true);
  });

  it('keeps the lunar date and the solar term', () => {
    render(<DayDetailCard date={DATE} />);

    expect(screen.getByText('Âm lịch: ngày 29 tháng 6')).toBeTruthy();
    expect(screen.getByText(/^Tiết /)).toBeTruthy();
  });

  it('notes mùng 1 on a gold rule in dawn', () => {
    render(<DayDetailCard date={firstMungMotAfter(DATE)} />);
    const note = screen.getByText(MUNG_MOT_NOTE);
    const tokens = classTokens(note);

    expect(tokens).toEqual(expect.arrayContaining(['border-gold/40', 'text-dawn']));
    expect(tokens.filter((token) => token.startsWith('bg-'))).toEqual([]);
  });

  it('draws no corner brackets', () => {
    const { container } = render(<DayDetailCard date={DATE} />);

    expect(container.querySelectorAll('svg')).toHaveLength(1);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('lucide-moon');
  });
});
