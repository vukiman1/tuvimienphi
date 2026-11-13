import { fireEvent, render, screen } from '@testing-library/react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { getPhiTinhBoards } from '@/lib/phi-tinh';
import { PhiTinhBoards } from './phi-tinh-boards';

const BOARDS = getPhiTinhBoards(new Date(2026, 7, 11), 15);
const GOOD_STAR_NOTE = ' (sao tốt)';
const GRADIENT_CLASS = /^bg-(gradient|linear)/;

function classTokens(element: Element | null): readonly string[] {
  return element?.getAttribute('class')?.split(/\s+/) ?? [];
}

function boardButtons(container: HTMLElement): readonly HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('button[aria-pressed]')];
}

describe('PhiTinhBoards', () => {
  it('titles the boards with a serif h2', () => {
    render(<PhiTinhBoards boards={BOARDS} />);

    expect(
      classTokens(screen.getByRole('heading', { level: 2, name: 'Cửu Cung Phi Tinh' })),
    ).toContain('font-emphasis');
  });

  it('marks good stars by shape and for screen readers, not colour alone', () => {
    const { container } = render(<PhiTinhBoards boards={BOARDS} />);
    const buttons = boardButtons(container);

    expect(buttons).toHaveLength(BOARDS.length);
    BOARDS.forEach((board, boardIndex) => {
      const cells = buttons[boardIndex].querySelectorAll(':scope > div > span');
      expect(cells).toHaveLength(board.cells.length);
      board.cells.forEach((cell, cellIndex) => {
        const element = cells[cellIndex];
        const note = element.querySelector('.sr-only');
        if (cell.isGood) {
          expect(classTokens(element)).toEqual(expect.arrayContaining(['ring-1', 'text-hanh-hoa']));
          expect(note?.textContent).toBe(GOOD_STAR_NOTE);
        } else {
          expect(classTokens(element)).not.toContain('ring-1');
          expect(classTokens(element)).not.toContain('text-hanh-hoa');
          expect(note).toBeNull();
        }
      });
    });
    expect(BOARDS.some((board) => board.cells.some((cell) => cell.isGood))).toBe(true);
  });

  it('rings the picked board in inset ink on a gold tint, beside the focus ring', () => {
    const { container } = render(<PhiTinhBoards boards={BOARDS} />);
    const first = boardButtons(container)[0];

    fireEvent.click(first);

    expect(first.getAttribute('aria-pressed')).toBe('true');
    expect(classTokens(first)).toEqual(
      expect.arrayContaining([
        'inset-ring-2',
        'inset-ring-ink',
        'bg-gold/10',
        ...FOCUS_RING_CLASS.split(' '),
      ]),
    );
    expect(classTokens(first)).not.toContain('ring-ink');
    expect(screen.getByText(`Phi tinh ${BOARDS[0].label}`)).toBeTruthy();
  });

  it('clears the pick when the same board is clicked again', () => {
    const { container } = render(<PhiTinhBoards boards={BOARDS} />);
    const first = boardButtons(container)[0];

    fireEvent.click(first);
    fireEvent.click(first);

    expect(first.getAttribute('aria-pressed')).toBe('false');
    expect(screen.getByText('Bấm vào từng bảng Phi Tinh để xem chi tiết.')).toBeTruthy();
  });

  it('gives every board the focus ring', () => {
    const { container } = render(<PhiTinhBoards boards={BOARDS} />);

    for (const button of boardButtons(container)) {
      expect(classTokens(button)).toEqual(expect.arrayContaining(FOCUS_RING_CLASS.split(' ')));
    }
  });

  it('draws no gradients', () => {
    const { container } = render(<PhiTinhBoards boards={BOARDS} />);

    const gradients = [...container.querySelectorAll('*')].filter((element) =>
      classTokens(element).some((token) => GRADIENT_CLASS.test(token)),
    );
    expect(gradients).toEqual([]);
  });
});
