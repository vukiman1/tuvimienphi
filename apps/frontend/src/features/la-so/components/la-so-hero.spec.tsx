import { render, screen, within } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { CalendarType, Gender } from '@/features/la-so/birth-input';
import { toChartView } from '@/features/la-so/to-chart-view';
import { LaSoHero } from './la-so-hero';

const VIEW_YEAR = 2026;
const BIRTH_YEAR = 1995;
const { meta } = toChartView({
  day: 12,
  month: 3,
  year: BIRTH_YEAR,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: VIEW_YEAR,
});

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function renderHero(): HTMLElement {
  render(
    <LaSoHero
      birthYear={BIRTH_YEAR}
      meta={meta}
      onViewYearChange={() => undefined}
      viewYear={VIEW_YEAR}
    />,
  );
  const title = screen.getByRole('heading', { level: 1, name: 'Lá Số Tử Vi' });
  const band = title.closest('section');
  expect(band).not.toBeNull();
  return band ?? document.body;
}

describe('LaSoHero', () => {
  it('opens with a Night hero holding the only h1', () => {
    const band = renderHero();

    expect(classTokens(band)).toContain('bg-night');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('shows âm dương and bản mệnh as the eyebrow', () => {
    const band = renderHero();

    expect(within(band).getByText(`${meta.amDuong} · ${meta.banMenh}`)).toBeTruthy();
  });

  it('keeps the year picker in the hero on a Day pill', () => {
    const band = renderHero();
    const picker = within(band).getByRole('combobox', { name: 'Năm xem' });

    expect(classTokens(picker)).toEqual(
      expect.arrayContaining(['bg-day', 'text-ink', ...FOCUS_RING_CLASS.split(' ')]),
    );
    expect(classTokens(within(band).getByText('Năm xem'))).toContain('text-day-soft');
  });
});
