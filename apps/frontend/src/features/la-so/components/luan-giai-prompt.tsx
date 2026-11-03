import { Eye } from 'lucide-react';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';

interface LuanGiaiPromptCardProps {
  readonly chapter: LuanGiaiChapter;
  readonly onRequest: () => void;
  /** Lý do lần xin trước hỏng, thường là đã hết suất trong ngày. */
  readonly error?: string;
  readonly actionLabel?: string;
}

const DEFAULT_ACTION_LABEL = 'Xem luận giải';

/** Trạng thái chưa nạp: chỉ nạp nội dung khi người dùng thật sự muốn đọc mục này. */
export function LuanGiaiPromptCard({
  chapter,
  onRequest,
  error,
  actionLabel = DEFAULT_ACTION_LABEL,
}: LuanGiaiPromptCardProps) {
  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader order={chapter.order} title={chapter.title} />

      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 py-10 text-center">
        <p className="max-w-[46ch] text-[16px] leading-[27px] text-[#6b6152]">
          Mục này được phân tích riêng từ lá số của bạn. Bấm để xem — mất vài giây.
        </p>
        <button
          className="inline-flex items-center gap-[9px] rounded-full bg-[#a8281c] px-7 py-[10px] text-[16px] leading-[24px] font-semibold text-[#f5e8d0] transition-colors outline-none hover:bg-[#8f2016] focus-visible:ring-2 focus-visible:ring-[#a8281c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf6ec]"
          onClick={onRequest}
          type="button"
        >
          <Eye aria-hidden className="size-[18px]" />
          {actionLabel}
        </button>
        {error ? (
          <p className="max-w-[46ch] text-[15px] leading-[24px] text-[#a8281c]">{error}</p>
        ) : null}
      </div>
    </LuanGiaiCard>
  );
}
