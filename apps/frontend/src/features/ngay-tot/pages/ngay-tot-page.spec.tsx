import { fireEvent, render, screen, within } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { FIXED_NOW, NON_DATE_TIMER_APIS } from '@/features/ngay-tot/__fixtures__/fixed-clock';
import { NgayTotPage } from './ngay-tot-page';

const TAB_LIST_NAME = 'Trường phái luận giải';

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function renderPage(): ReturnType<typeof render> {
  return render(<NgayTotPage />);
}

function heroSection(): HTMLElement {
  const title = screen.getByRole('heading', { level: 1 });
  const section = title.closest('section');
  expect(section).not.toBeNull();
  return section ?? document.body;
}

function dayButton(solarDay: string): HTMLElement {
  const match = screen
    .getAllByRole('button')
    .find((button) => button.firstElementChild?.textContent === solarDay);
  expect(match).toBeDefined();
  return match ?? document.body;
}

describe('NgayTotPage', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: FIXED_NOW, doNotFake: [...NON_DATE_TIMER_APIS] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens with a Night hero holding the only h1', () => {
    renderPage();

    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Ngày Tốt');
    expect(classTokens(heroSection())).toContain('bg-night');
    expect(
      within(heroSection()).getByText('Xem lịch âm dương trong tháng, ngày mùng 1 và ngày rằm.'),
    ).toBeTruthy();
  });

  it('accents Tốt in the h1', () => {
    renderPage();

    const accent = screen.getByRole('heading', { level: 1 }).querySelector('.italic');
    expect(accent?.textContent).toBe('Tốt');
    expect(classTokens(accent)).toContain('text-dawn');
  });

  it('puts the school tabs in the hero with Hiệp Kỷ chosen', () => {
    renderPage();

    const tabList = within(heroSection()).getByRole('tablist', { name: TAB_LIST_NAME });
    const tabs = within(tabList).getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    const chosen = within(tabList).getByRole('tab', { name: 'Hiệp Kỷ' });
    expect(chosen.getAttribute('aria-selected')).toBe('true');
    expect(classTokens(chosen)).toEqual(expect.arrayContaining(['bg-gold', 'text-ink']));
    for (const name of ['Phi Tinh', 'Nhị Thập Bát Tú']) {
      expect(classTokens(within(tabList).getByRole('tab', { name }))).toContain('text-day');
    }
    for (const tab of tabs) {
      expect(classTokens(tab)).toEqual(
        expect.arrayContaining(['min-h-11', ...FOCUS_RING_CLASS.split(' ')]),
      );
    }
  });

  it('sets the calendar and the panel on a Day zone', () => {
    renderPage();

    const previousMonth = screen.getByRole('button', { name: 'Tháng trước' });
    expect(classTokens(previousMonth.closest('section'))).toContain('bg-day');
    expect(heroSection().contains(previousMonth)).toBe(false);
  });

  it('keeps the calendar and the picked day while switching schools', () => {
    renderPage();

    fireEvent.click(dayButton('20'));
    fireEvent.click(screen.getByRole('tab', { name: 'Phi Tinh' }));

    const panel = screen.getByRole('tabpanel');
    expect(panel.getAttribute('aria-labelledby')).toBe('tab-phi-tinh');
    expect(within(panel).getByText('Cửu Cung Phi Tinh')).toBeTruthy();
    expect(screen.getByText('Tháng 8, 2026')).toBeTruthy();
    expect(dayButton('20').getAttribute('aria-pressed')).toBe('true');
    expect(screen.queryByRole('heading', { level: 2, name: 'Giờ tốt xấu trong ngày' })).toBeNull();
  });

  it('shows the hour cards only on Hiệp Kỷ', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 2, name: 'Giờ tốt xấu trong ngày' })).toBeTruthy();

    fireEvent.click(screen.getByRole('tab', { name: 'Nhị Thập Bát Tú' }));

    expect(screen.queryByRole('heading', { level: 2, name: 'Giờ tốt xấu trong ngày' })).toBeNull();
  });

  it('renders no image but the hero painting', () => {
    const { container } = renderPage();

    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);
    expect(heroSection().contains(images[0])).toBe(true);
  });

  it('paints the hero from desktop width as a lazy decorative image phones and tablets never show', () => {
    renderPage();

    const painting = heroSection().querySelector('img');
    expect(painting?.getAttribute('alt')).toBe('');
    expect(painting?.getAttribute('loading')).toBe('lazy');
    expect(painting?.getAttribute('srcset')).toBe(
      '/ngay-tot/hero-dawn-768.webp 768w, /ngay-tot/hero-dawn-1536.webp 1536w',
    );
    expect(classTokens(painting)).toEqual(expect.arrayContaining(['hidden', 'lg:block']));
    expect(classTokens(painting)).not.toContain('md:block');
  });
});
