import { render, screen } from '@testing-library/react';
import { MethodologyNote } from './methodology-note';

const FACTS_LINE = 'Bảng dữ kiện được tính bằng bộ máy an sao của trang.';
const AI_LINE = 'Phần chữ được soạn với sự hỗ trợ của AI, từ chính những dữ kiện đó.';
const REVIEWED_AT = '2026-11-10';

describe('MethodologyNote', () => {
  it('discloses AI help on every page', () => {
    render(<MethodologyNote hasFacts={false} reviewedAt={REVIEWED_AT} isOwnerRead={false} />);

    expect(screen.getByRole('heading', { level: 2, name: 'Cách soạn bài' })).toBeTruthy();
    expect(screen.getByText(AI_LINE)).toBeTruthy();
  });

  it('credits the engine only when a facts table is shown', () => {
    const { rerender } = render(
      <MethodologyNote hasFacts={false} reviewedAt={REVIEWED_AT} isOwnerRead={false} />,
    );
    expect(screen.queryByText(FACTS_LINE)).toBeNull();

    rerender(<MethodologyNote hasFacts reviewedAt={REVIEWED_AT} isOwnerRead={false} />);
    expect(screen.getByText(FACTS_LINE)).toBeTruthy();
  });

  it('claims a review only for pages Kim An read', () => {
    const { rerender } = render(
      <MethodologyNote hasFacts={false} reviewedAt={REVIEWED_AT} isOwnerRead={false} />,
    );
    expect(screen.queryByText(/đã được đọc và duyệt/)).toBeNull();

    rerender(<MethodologyNote hasFacts={false} reviewedAt={REVIEWED_AT} isOwnerRead />);
    expect(screen.getByText('Nội dung đã được đọc và duyệt ngày 10/11/2026.')).toBeTruthy();
  });
});
