import { fireEvent, render, screen } from '@testing-library/react';
import { convertSolarToLunar } from '@org/shared-tu-vi';
import { FOCUS_RING_CLASS } from '@/design-system';
import { FIXED_NOW, NON_DATE_TIMER_APIS } from '@/features/ngay-tot/__fixtures__/fixed-clock';
import { MonthCalendar } from './month-calendar';

const VIEW_YEAR = 2026;
const VIEW_MONTH = 8;
const GRID_START = new Date(2026, 6, 27);
const DAY_CELL_COUNT = 42;
const MONTH_CONTROL_COUNT = 3;
const FADED_TEXT = /^text-[\w-]+\/\d+$/;

interface CalendarHandlers {
  readonly onSelectDate: jest.Mock;
  readonly onStepMonth: jest.Mock;
  readonly onGoToday: jest.Mock;
}

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function gridDate(index: number): Date {
  return new Date(GRID_START.getFullYear(), GRID_START.getMonth(), GRID_START.getDate() + index);
}

function renderCalendar(selectedDate: Date = FIXED_NOW): {
  readonly container: HTMLElement;
  readonly handlers: CalendarHandlers;
} {
  const handlers: CalendarHandlers = {
    onSelectDate: jest.fn(),
    onStepMonth: jest.fn(),
    onGoToday: jest.fn(),
  };
  const { container } = render(
    <MonthCalendar
      onGoToday={handlers.onGoToday}
      onSelectDate={handlers.onSelectDate}
      onStepMonth={handlers.onStepMonth}
      selectedDate={selectedDate}
      viewMonth={VIEW_MONTH}
      viewYear={VIEW_YEAR}
    />,
  );
  return { container, handlers };
}

function dayButtons(container: HTMLElement): readonly HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('button[aria-pressed]')];
}

describe('MonthCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FIXED_NOW, doNotFake: [...NON_DATE_TIMER_APIS] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks the selected day with a gold fill and an inset ink ring that survives focus', () => {
    const { container } = renderCalendar(new Date(2026, 7, 20));
    const pressed = container.querySelectorAll('button[aria-pressed="true"]');

    expect(pressed).toHaveLength(1);
    expect(pressed[0].firstElementChild?.textContent).toBe('20');
    expect(classTokens(pressed[0])).toEqual(
      expect.arrayContaining([
        'bg-gold',
        'inset-ring-2',
        'inset-ring-ink',
        ...FOCUS_RING_CLASS.split(' '),
      ]),
    );
    expect(classTokens(pressed[0])).not.toContain('ring-ink');
    expect(container.querySelectorAll('button.bg-gold')).toHaveLength(1);
  });

  it('rings today with an inset ring that survives focus, without filling it', () => {
    const { container } = renderCalendar(new Date(2026, 7, 20));
    const today = container.querySelector('button[aria-current="date"]');

    expect(today?.firstElementChild?.textContent).toBe('11');
    expect(classTokens(today)).toEqual(
      expect.arrayContaining(['inset-ring-1', 'inset-ring-ink', ...FOCUS_RING_CLASS.split(' ')]),
    );
    expect(classTokens(today)).not.toContain('ring-ink');
    expect(classTokens(today)).not.toContain('bg-gold');
  });

  it("sets other months' days apart without fading their text", () => {
    const { container } = renderCalendar();
    const firstCell = dayButtons(container)[0];

    expect(classTokens(firstCell)).not.toContain('bg-day-200');
    for (const span of firstCell.querySelectorAll('span')) {
      expect(classTokens(span)).toContain('text-ink-soft');
    }
    for (const element of container.querySelectorAll('*')) {
      const faded = classTokens(element).filter(
        (token) => FADED_TEXT.test(token) || token.startsWith('opacity-'),
      );
      expect(faded).toEqual([]);
    }
  });

  it('shows mùng 1 and rằm in bold dusk', () => {
    const { container } = renderCalendar();
    const mungMotIndex = Array.from({ length: DAY_CELL_COUNT }, (_, index) =>
      convertSolarToLunar(gridDate(index)),
    ).findIndex((lunar) => lunar.day === 1);
    const lunarSpan = dayButtons(container)[mungMotIndex].lastElementChild;

    expect(classTokens(lunarSpan)).toEqual(expect.arrayContaining(['font-bold', 'text-dusk']));
  });

  it('keeps Sunday red under the CN header', () => {
    const { container } = renderCalendar();
    const augustSecond = dayButtons(container)[6];

    expect(classTokens(screen.getByText('CN'))).toContain('text-danger');
    expect(augustSecond.firstElementChild?.textContent).toBe('2');
    expect(classTokens(augustSecond.firstElementChild)).toContain('text-danger');
  });

  it('gives the month buttons a 44 px target and the focus ring', () => {
    const { container } = renderCalendar();

    for (const name of ['Tháng trước', 'Tháng sau']) {
      expect(classTokens(screen.getByRole('button', { name }))).toContain('size-11');
    }
    expect(classTokens(screen.getByRole('button', { name: 'Hôm nay' }))).toContain('min-h-11');

    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(DAY_CELL_COUNT + MONTH_CONTROL_COUNT);
    for (const button of buttons) {
      expect(classTokens(button)).toEqual(expect.arrayContaining(FOCUS_RING_CLASS.split(' ')));
    }
  });

  it('puts the month title before its controls', () => {
    renderCalendar();
    const title = screen.getByText('Tháng 8, 2026');
    const previous = screen.getByRole('button', { name: 'Tháng trước' });

    expect(title.compareDocumentPosition(previous) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('steps the month and returns to today', () => {
    const { handlers } = renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: 'Tháng sau' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tháng trước' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hôm nay' }));

    expect(handlers.onStepMonth.mock.calls).toEqual([[1], [-1]]);
    expect(handlers.onGoToday).toHaveBeenCalledTimes(1);
  });

  it('draws no images and no corner brackets', () => {
    const { container } = renderCalendar();

    expect(container.querySelectorAll('img')).toHaveLength(0);
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });
});
