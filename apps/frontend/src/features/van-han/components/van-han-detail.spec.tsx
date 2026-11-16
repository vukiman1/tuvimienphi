import { fireEvent, render, screen, within } from '@testing-library/react';
import type { VanHanEntry } from '@org/shared-contracts';
import { FOCUS_RING_CLASS } from '@/design-system';
import { TY_ENTRY } from '../__fixtures__/van-han-current';
import { toVanHanFortune } from '../map-van-han';
import { VanHanDetail, VanHanDetailEmpty } from './van-han-detail';

const THEMED_COLOUR = /rose|violet|green|sky|orange|amber|uppercase/;

const LONG_ASPECT_ENTRY: VanHanEntry = {
  ...TY_ENTRY,
  luanGiai: [
    {
      aspect: 'Tài Vận',
      rating: 2,
      body: 'Tiền vào đều. Nên giữ tiền. Tránh cho vay. Cuối năm khá hơn. Đầu tư nhỏ.',
    },
  ],
};

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function aspectSection(): HTMLElement {
  const section = screen
    .getByRole('heading', { level: 2, name: 'Vận Thế Luận Giải' })
    .closest('section');
  expect(section).not.toBeNull();
  return section ?? document.body;
}

function allClassTokens(root: HTMLElement): readonly string[] {
  return Array.from(root.querySelectorAll('[class]')).flatMap(classTokens);
}

function renderDetail(entry: VanHanEntry = TY_ENTRY): void {
  render(<VanHanDetail chi="Tý" fortune={toVanHanFortune(entry)} />);
}

function cardOf(element: HTMLElement): HTMLElement {
  const card = element.closest('article');
  expect(card).not.toBeNull();
  return card instanceof HTMLElement ? card : document.body;
}

describe('VanHanDetail', () => {
  it('titles the three sections with serif h2s', () => {
    renderDetail();

    const titles = screen.getAllByRole('heading', { level: 2 });
    expect(titles.map((title) => title.textContent)).toEqual([
      'Lưu Niên Vận Thế',
      'Vận Thế Luận Giải',
      'Vận Hạn Từng Tuổi',
    ]);
    for (const title of titles) {
      expect(classTokens(title)).toContain('font-emphasis');
    }
  });

  it('sets the yearly overview in the reading zone', () => {
    renderDetail();

    for (const paragraph of toVanHanFortune(TY_ENTRY).overview) {
      const zone = screen.getByText(paragraph).closest('.max-w-reading');
      expect(zone).not.toBeNull();
      expect(classTokens(zone)).toContain('text-reading');
    }
  });

  it('names each aspect in an h3 with its rating', () => {
    renderDetail();

    const label = screen.getByRole('heading', { level: 3, name: 'Công danh' });
    expect(within(cardOf(label)).getByRole('img', { name: '4 trên 5 sao' })).toBeTruthy();
  });

  it('shows three points, then the rest behind a toggle that says whether it is open', () => {
    renderDetail(LONG_ASPECT_ENTRY);

    const card = cardOf(screen.getByRole('heading', { level: 3, name: 'Tài Vận' }));
    expect(within(card).getAllByRole('listitem')).toHaveLength(3);
    const toggle = within(card).getByRole('button', { name: 'Xem chi tiết ›' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(classTokens(toggle)).toEqual(
      expect.arrayContaining(['min-h-11', 'border-ink-soft', ...FOCUS_RING_CLASS.split(' ')]),
    );

    fireEvent.click(toggle);

    expect(within(card).getAllByRole('listitem')).toHaveLength(5);
    expect(toggle.textContent).toBe('Thu gọn');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('gives every aspect the same card, without coins or gradients', () => {
    renderDetail();

    const aspects = aspectSection();
    const cards = Array.from(aspects.querySelectorAll('article'));
    expect(cards).toHaveLength(toVanHanFortune(TY_ENTRY).aspects.length);
    expect(aspects.querySelectorAll('img')).toHaveLength(0);
    expect(
      cards
        .flatMap((card) => [...classTokens(card), ...allClassTokens(card)])
        .filter(
          (token) =>
            token.startsWith('bg-gradient') ||
            token.startsWith('bg-linear') ||
            token.startsWith('text-['),
        ),
    ).toEqual([]);
  });

  it('does not animate the cards in', () => {
    renderDetail();

    expect(
      allClassTokens(document.body).filter(
        (token) =>
          token.includes('animate-') || token.includes('fade-in') || token.includes('slide-in'),
      ),
    ).toEqual([]);
    expect(document.body.querySelectorAll('[style]')).toHaveLength(0);
  });

  it('heads each birth year with its can chi, year and element', () => {
    renderDetail();

    expect(classTokens(screen.getByText('Giáp Tý'))).toEqual(
      expect.arrayContaining(['font-display', 'font-extrabold']),
    );
    expect(screen.getByText('Sinh năm 1984')).toBeTruthy();
    expect(classTokens(screen.getByText('Kim'))).toEqual(
      expect.arrayContaining(['bg-day-200', 'text-ink']),
    );
  });

  it('tells Nam and Nữ apart by their labels, in the same ink', () => {
    renderDetail();

    expect(classTokens(screen.getByText('Nam'))).toContain('text-ink');
    expect(classTokens(screen.getByText('Nữ'))).toContain('text-ink');
    const card = cardOf(screen.getByText('Giáp Tý'));
    expect(allClassTokens(card).filter((token) => THEMED_COLOUR.test(token))).toEqual([]);
  });

  it('keeps both readings in full', () => {
    renderDetail();

    expect(screen.getByText('Nam mạng gặp sao Kế Đô.')).toBeTruthy();
    expect(screen.getByText('Nữ mạng gặp sao Thái Dương.')).toBeTruthy();
  });
});

describe('VanHanDetailEmpty', () => {
  it('titles the empty state with the con giáp and says when to come back', () => {
    render(<VanHanDetailEmpty chi="Tý" />);

    const title = screen.getByText('Tuổi Tý');
    expect(classTokens(title)).toContain('font-emphasis');
    expect(
      screen.getByText('Vận hạn của tuổi Tý chưa được cập nhật. Vui lòng quay lại sau.'),
    ).toBeTruthy();
    const tile = title.parentElement;
    expect(classTokens(tile)).toEqual(expect.arrayContaining(['bg-day-200', 'min-h-60']));
    expect(document.body.textContent).not.toContain('❖');
  });
});
