import { render, screen, within } from '@testing-library/react';
import { getGioXuatHanh } from '@/lib/gio-xuat-hanh';
import { XuatHanhHours } from './xuat-hanh-hours';

const SLOTS = getGioXuatHanh({ day: 29, month: 6, year: 2026, isLeapMonth: false });

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function slotItem(name: string): HTMLElement {
  const item = screen.getByText(name).closest('li');
  expect(item).not.toBeNull();
  return item ?? document.body;
}

function badge(item: HTMLElement, label: string): HTMLElement | null {
  return within(item).getByText(label).closest('span');
}

describe('XuatHanhHours', () => {
  it('titles the slots with a serif h2', () => {
    render(<XuatHanhHours slots={SLOTS} />);
    const tokens = classTokens(screen.getByRole('heading', { level: 2, name: 'Giờ Xuất Hành' }));

    expect(tokens).toEqual(expect.arrayContaining(['font-emphasis', 'font-bold']));
    expect(tokens).not.toContain('uppercase');
  });

  it('says good and bad in words and icons, not colour alone', () => {
    render(<XuatHanhHours slots={SLOTS} />);

    const good = slotItem('Đại An');
    expect(within(good).getByText('Giờ tốt')).toBeTruthy();
    expect(good.querySelector('svg')).not.toBeNull();

    const bad = slotItem('Xích Khẩu');
    expect(within(bad).getByText('Giờ xấu')).toBeTruthy();
    expect(bad.querySelector('svg')).not.toBeNull();
  });

  it('sets good slots on a gold badge and bad slots on an ink badge', () => {
    render(<XuatHanhHours slots={SLOTS} />);

    expect(classTokens(badge(slotItem('Đại An'), 'Giờ tốt'))).toEqual(
      expect.arrayContaining(['bg-gold', 'text-ink']),
    );
    expect(classTokens(badge(slotItem('Xích Khẩu'), 'Giờ xấu'))).toEqual(
      expect.arrayContaining(['bg-ink', 'text-day']),
    );
  });

  it('rings good slots in gold and lays bad slots on day-200', () => {
    render(<XuatHanhHours slots={SLOTS} />);

    expect(classTokens(slotItem('Đại An'))).toContain('border-gold');
    expect(classTokens(slotItem('Xích Khẩu'))).toContain('bg-day-200');
  });

  it('ships no Lục Diệu images', () => {
    const { container } = render(<XuatHanhHours slots={SLOTS} />);

    expect(container.querySelectorAll('img')).toHaveLength(0);
  });
});
