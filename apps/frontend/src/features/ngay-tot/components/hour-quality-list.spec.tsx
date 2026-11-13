import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { FIXED_NOW, NON_DATE_TIMER_APIS } from '@/features/ngay-tot/__fixtures__/fixed-clock';
import { getGioHoangDao } from '@/lib/gio-hoang-dao';
import { HourQualityList } from './hour-quality-list';

const ITEMS = getGioHoangDao(new Date(2026, 7, 11));
const HOURS_PER_GROUP = 6;
const HOUR_COUNT = 12;
const CHI_COUNT = 12;
const SECTION_TITLE = 'Giờ tốt xấu trong ngày';

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function renderList(isToday = true): ReturnType<typeof render> {
  return render(<HourQualityList items={ITEMS} isToday={isToday} />);
}

function cardButton(canChi: string): HTMLElement {
  const button = screen.getByText(canChi).closest('button');
  expect(button).not.toBeNull();
  return button ?? document.body;
}

function cardSurface(canChi: string): Element | null {
  return cardButton(canChi).firstElementChild;
}

function litPoint(scope: Element): readonly [string | null, string | null] {
  const point = scope.querySelector('circle.fill-gold');
  return [point?.getAttribute('cx') ?? null, point?.getAttribute('cy') ?? null];
}

function hourButtons(): readonly HTMLElement[] {
  return screen.getAllByRole('listitem').flatMap((item) => within(item).queryAllByRole('button'));
}

describe('HourQualityList', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FIXED_NOW, doNotFake: [...NON_DATE_TIMER_APIS] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('groups the hours under Hoàng đạo and Hắc đạo headings', () => {
    renderList();

    for (const name of ['Giờ Hoàng đạo', 'Giờ Hắc đạo']) {
      const heading = screen.getByRole('heading', { level: 3, name });
      const list = heading.parentElement?.nextElementSibling;
      expect(list?.tagName).toBe('UL');
      expect(list?.querySelectorAll('button')).toHaveLength(HOURS_PER_GROUP);
    }
    expect(screen.getByText('6 giờ Hoàng đạo')).toBeTruthy();
    expect(screen.getByText('6 giờ Hắc đạo')).toBeTruthy();
  });

  it('titles the section with a serif h2', () => {
    renderList();
    const tokens = classTokens(screen.getByRole('heading', { level: 2, name: SECTION_TITLE }));

    expect(tokens).toContain('font-emphasis');
    expect(tokens).not.toContain('uppercase');
  });

  it('gives every hour card the two-tone focus ring', () => {
    renderList();
    const buttons = hourButtons();

    expect(buttons).toHaveLength(HOUR_COUNT);
    for (const button of buttons) {
      expect(classTokens(button)).toEqual(expect.arrayContaining(FOCUS_RING_CLASS.split(' ')));
      expect(classTokens(button)).not.toContain('focus-visible:outline-none');
    }
  });

  it('stretches every hour card to its row height', () => {
    renderList();

    for (const button of hourButtons()) {
      expect(classTokens(button)).toContain('h-full');
      expect(classTokens(button.firstElementChild)).toContain('h-full');
    }
  });

  it('rings hoàng đạo cards in gold and lays hắc đạo cards on day-200', () => {
    renderList(false);

    expect(classTokens(cardSurface('Bính Ngọ'))).toContain('border-gold');
    expect(within(cardButton('Bính Ngọ')).getByText('Hoàng đạo')).toBeTruthy();
    expect(classTokens(cardSurface('Canh Tý'))).toContain('bg-day-200');
    expect(within(cardButton('Canh Tý')).getByText('Hắc đạo')).toBeTruthy();
  });

  it('rates with filled and outline stars, never faded ones', () => {
    const { container } = renderList();
    const rating = within(cardButton('Bính Ngọ')).getByRole('img', { name: '4 trên 5 sao' });

    expect(rating.querySelectorAll('svg.fill-gold')).toHaveLength(4);
    expect(rating.querySelectorAll('svg.fill-transparent')).toHaveLength(1);
    const faded = [...container.querySelectorAll('*')].filter((element) =>
      classTokens(element).some((token) => token.startsWith('opacity-')),
    );
    expect(faded).toEqual([]);
  });

  it('marks the current hour only when the day is today, unlike the focus outline', () => {
    const { rerender } = renderList(true);

    expect(within(cardButton('Ất Tị')).getByText('Bây giờ')).toBeTruthy();
    const surface = classTokens(cardSurface('Ất Tị'));
    expect(surface).toEqual(expect.arrayContaining(['inset-ring-2', 'inset-ring-gold']));
    expect(surface).not.toContain('ring-ink');

    rerender(<HourQualityList items={ITEMS} isToday={false} />);

    expect(screen.queryByText('Bây giờ')).toBeNull();
  });

  it('opens the hour’s detail with the same marks', () => {
    renderList();
    const cardLitPoint = litPoint(cardButton('Bính Ngọ'));

    fireEvent.click(cardButton('Bính Ngọ'));

    const dialog = screen.getByRole('dialog', { name: 'Bính Ngọ' });
    expect(within(dialog).getByText('11h - 13h · Hoàng đạo')).toBeTruthy();
    expect(within(dialog).getByRole('img', { name: '4 trên 5 sao' })).toBeTruthy();
    const dials = [...dialog.querySelectorAll('svg[aria-hidden="true"]')].filter(
      (svg) => svg.querySelectorAll('circle:not([fill="none"])').length === CHI_COUNT,
    );
    expect(dials).toHaveLength(1);
    expect(litPoint(dials[0])).toEqual(cardLitPoint);
    expect(Number(cardLitPoint[1])).toBeGreaterThan(0);
    expect(classTokens(within(dialog).getByText('Tinh'))).toEqual(
      expect.arrayContaining(['bg-day', 'text-ink']),
    );
    expect(classTokens(within(dialog).getByText('Nghi'))).toContain('bg-gold');
    expect(classTokens(within(dialog).getByText('Kỵ'))).toEqual(
      expect.arrayContaining(['bg-ink', 'text-day']),
    );
  });

  it('centres the stars on the card and left-aligns them in the dialog', () => {
    renderList();
    const cardRating = within(cardButton('Bính Ngọ')).getByRole('img', { name: '4 trên 5 sao' });

    fireEvent.click(cardButton('Bính Ngọ'));
    const dialogRating = within(screen.getByRole('dialog')).getByRole('img', {
      name: '4 trên 5 sao',
    });

    expect(classTokens(cardRating)).toContain('justify-center');
    expect(classTokens(dialogRating)).not.toContain('justify-center');
  });

  it('returns focus to the hour card when the dialog closes', async () => {
    renderList();
    const card = cardButton('Bính Ngọ');

    card.focus();
    fireEvent.click(card);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(card));
  });

  it('ships no zodiac, plate or painting images', () => {
    const { container } = renderList();

    expect(container.querySelectorAll('img')).toHaveLength(0);

    fireEvent.click(cardButton('Bính Ngọ'));

    expect(screen.getByRole('dialog').querySelectorAll('img')).toHaveLength(0);
  });
});
