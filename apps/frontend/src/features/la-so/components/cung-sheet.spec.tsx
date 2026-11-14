import { fireEvent, render, screen } from '@testing-library/react';
import { CungSheet } from './cung-sheet';

const SCROLLED_OFFSET = 200;
const BODY_TEXT = 'Nội dung cung';
const SCROLLING_CLASS = 'overflow-y-auto';

function renderSheet(): void {
  render(
    <CungSheet
      onCloseFocus={() => undefined}
      onOpenChange={() => undefined}
      onStep={() => undefined}
      open
      title="Cung Quan Lộc"
    >
      <p>{BODY_TEXT}</p>
    </CungSheet>,
  );
}

function scrollingBody(): HTMLElement {
  const body = screen.getByText(BODY_TEXT).closest<HTMLElement>(`.${SCROLLING_CLASS}`);
  if (body === null) throw new Error('the sheet body does not scroll');
  return body;
}

describe('CungSheet', () => {
  it('keeps the sheet controls outside the scrolling body', () => {
    renderSheet();
    const body = scrollingBody();

    for (const name of ['Cung trước', 'Cung sau', 'Đóng']) {
      expect(body.contains(screen.getByRole('button', { name }))).toBe(false);
    }
  });

  it('opens the next cung at its top', () => {
    renderSheet();
    const body = scrollingBody();
    Object.defineProperty(body, 'scrollTop', { value: SCROLLED_OFFSET, writable: true });

    fireEvent.click(screen.getByRole('button', { name: 'Cung sau' }));

    expect(body.scrollTop).toBe(0);
  });

  it('opens the previous cung at its top', () => {
    renderSheet();
    const body = scrollingBody();
    Object.defineProperty(body, 'scrollTop', { value: SCROLLED_OFFSET, writable: true });

    fireEvent.click(screen.getByRole('button', { name: 'Cung trước' }));

    expect(body.scrollTop).toBe(0);
  });
});
