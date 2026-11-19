import type { ReactElement } from 'react';
import { formatReviewedAt } from '../reviewed-date';

const METHODOLOGY_TITLE_ID = 'methodology-title';
const FACTS_LINE = 'Bảng dữ kiện được tính bằng bộ máy an sao của trang.';
const AI_LINE = 'Phần chữ được soạn với sự hỗ trợ của AI, từ chính những dữ kiện đó.';

interface MethodologyNoteProps {
  readonly hasFacts: boolean;
  readonly reviewedAt: string;
  readonly isOwnerRead: boolean;
}

export function MethodologyNote({
  hasFacts,
  reviewedAt,
  isOwnerRead,
}: MethodologyNoteProps): ReactElement {
  return (
    <section
      aria-labelledby={METHODOLOGY_TITLE_ID}
      className="rounded-2xl bg-day-200 px-6 py-6 text-ink"
    >
      <h2 id={METHODOLOGY_TITLE_ID} className="text-xl font-bold">
        Cách soạn bài
      </h2>
      <div className="mt-4 flex flex-col gap-3 text-base leading-relaxed text-ink-soft">
        {hasFacts && <p>{FACTS_LINE}</p>}
        <p>{AI_LINE}</p>
        {isOwnerRead && (
          <p>{`Nội dung đã được đọc và duyệt ngày ${formatReviewedAt(reviewedAt)}.`}</p>
        )}
      </div>
    </section>
  );
}
