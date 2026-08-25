import { Eye } from 'lucide-react';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';

interface LuanGiaiPromptCardProps {
  readonly chapter: LuanGiaiChapter;
  readonly onRequest: () => void;
}

/** Trạng thái chưa nạp: chỉ nạp nội dung khi người dùng thật sự muốn đọc mục này. */
export function LuanGiaiPromptCard({ chapter, onRequest }: LuanGiaiPromptCardProps) {
  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader order={chapter.order} title={chapter.title} />

      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 py-10 text-center">
        <p className="max-w-[46ch] font-body text-[16px] leading-[27px] text-[#6b6152]">
          Mục này được phân tích riêng từ lá số của bạn. Bấm để xem.
        </p>
        <button
          className="inline-flex items-center gap-[9px] rounded-full bg-[#a8281c] px-7 py-[10px] font-body text-[16px] leading-[24px] font-semibold text-[#f5e8d0] transition-colors outline-none hover:bg-[#8f2016] focus-visible:ring-2 focus-visible:ring-[#a8281c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf6ec]"
          onClick={onRequest}
          type="button"
        >
          {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-5` thành 27.5px, to hơn hẳn chữ 16px. */}
          <Eye aria-hidden className="size-[18px]" />
          Xem luận giải
        </button>
      </div>
    </LuanGiaiCard>
  );
}
