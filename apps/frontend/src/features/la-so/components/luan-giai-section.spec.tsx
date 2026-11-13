import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CalendarType, Gender, type BirthInput } from '@org/shared-contracts';
import { LUAN_GIAI_CHAPTERS, LUAN_GIAI_MOTTO } from '@/features/la-so/luan-giai-data';
import { LuanGiaiSection } from './luan-giai-section';

jest.mock('@/lib/http-request', () => ({
  httpRequest: { get: jest.fn(() => new Promise(() => undefined)), post: jest.fn() },
}));

const BIRTH: BirthInput = {
  day: 12,
  month: 3,
  year: 1995,
  calendar: CalendarType.Solar,
  hour: 'Ngọ',
  gender: Gender.Male,
};
const VIEW_YEAR = 2026;
const SECOND_CHAPTER = LUAN_GIAI_CHAPTERS[1].order;

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function renderSection(): ReturnType<typeof render> {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <LuanGiaiSection
        activeChapter={SECOND_CHAPTER}
        birth={BIRTH}
        chapters={LUAN_GIAI_CHAPTERS}
        motto={LUAN_GIAI_MOTTO}
        onSelectChapter={() => undefined}
        viewYear={VIEW_YEAR}
      />
    </QueryClientProvider>,
  );
}

describe('LuanGiaiSection', () => {
  it('opens luận giải on a Deep band with a serif title', () => {
    renderSection();
    const title = screen.getByRole('heading', { level: 2, name: 'Luận giải lá số' });

    expect(classTokens(title)).toContain('font-emphasis');
    expect(classTokens(title.closest('section'))).toContain('bg-deep');
  });

  it('marks the chosen chapter tab in gold', () => {
    renderSection();
    const tabs = screen.getAllByRole('tab');

    expect(tabs).toHaveLength(LUAN_GIAI_CHAPTERS.length);
    for (const tab of tabs) {
      const isSelected = tab.getAttribute('aria-selected') === 'true';
      if (isSelected) {
        expect(classTokens(tab)).toEqual(expect.arrayContaining(['bg-gold', 'text-ink']));
      } else {
        expect(classTokens(tab)).toContain('text-day');
      }
    }
    expect(tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  });

  it('sets the chapter on Day inside the reading zone', () => {
    const { container } = renderSection();
    const zone = container.querySelector('article')?.closest('.max-w-reading');

    expect(zone ?? null).not.toBeNull();
    expect(zone?.parentElement?.closest('.bg-day') ?? null).not.toBeNull();
  });

  it('keeps both motto lines', () => {
    renderSection();

    for (const line of LUAN_GIAI_MOTTO) {
      expect(screen.getByText(line)).toBeTruthy();
    }
  });

  it('draws no raster images', () => {
    const { container } = renderSection();

    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
