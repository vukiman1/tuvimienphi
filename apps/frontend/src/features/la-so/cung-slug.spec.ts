import { CUNG_NAMES } from '@org/shared-tu-vi';
import { CalendarType, Gender } from '@/features/la-so/birth-input';
import type { CungView } from '@/features/la-so/chart-types';
import { toChartView } from '@/features/la-so/to-chart-view';
import { CUNG_SLUGS, UnknownCungNameError, cungNameFromSlug, cungNameOf } from './cung-slug';

const CHART = toChartView({
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
  viewYear: 2026,
});

describe('cungNameFromSlug', () => {
  it('round-trips every cung', () => {
    for (const name of CUNG_NAMES) {
      expect(cungNameFromSlug(CUNG_SLUGS[name])).toBe(name);
    }
  });

  it('ignores an unknown slug', () => {
    expect(cungNameFromSlug('abc')).toBeNull();
  });

  it('ignores a missing slug', () => {
    expect(cungNameFromSlug(undefined)).toBeNull();
  });
});

describe('cungNameOf', () => {
  it('maps every uppercase view name back to its cung name', () => {
    const names = CHART.cungs.map(cungNameOf);

    expect([...names].sort()).toEqual([...CUNG_NAMES].sort());
  });

  it('names the unknown cung when a view matches none', () => {
    const stray = { ...CHART.cungs[0], name: 'LẠ' } satisfies CungView;

    expect(() => cungNameOf(stray)).toThrow(UnknownCungNameError);
    expect(() => cungNameOf(stray)).toThrow('LẠ');
  });
});
