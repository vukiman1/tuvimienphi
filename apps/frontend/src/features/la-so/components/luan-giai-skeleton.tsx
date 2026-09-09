import { useEffect, useState } from 'react';
import { LuanGiaiCard } from '@/features/la-so/components/luan-giai-card';
import { cn } from '@/lib/utils';

const BLOCK_CLASS = 'animate-pulse rounded bg-[#e3d7ba] motion-reduce:animate-none';

/** Bề rộng lệch nhau cho mấy vạch chờ trông như đoạn văn thật, không như bảng biểu. */
const LINE_WIDTHS = ['w-full', 'w-[96%]', 'w-[88%]', 'w-[93%]', 'w-[62%]'] as const;

/** Đo thật thì một bài mất 1,5–5,5 giây, nên nhịp này đưa người đọc tới bước cuối vào khoảng đó. */
const STEP_HOLD_MS = 1_200;

interface LuanGiaiSkeletonCardProps {
  /**
   * Các bước hiện lần lượt trong lúc chờ. Chỉ truyền khi thực sự đang viết bài — đọc bài đã có thì
   * xong trong tích tắc, kể lể các bước ở đó là nói sai.
   *
   * Nhịp là ước lượng chứ không phải tiến trình thật: máy chủ làm xong mới trả một lần, không có
   * đường nào báo về đang ở bước nào. Các bước thì có thật và đúng thứ tự đó.
   */
  readonly steps?: readonly string[];
}

/** Khung chờ dựng theo đúng bố cục thẻ bài, để lúc nội dung về không bị nhảy layout. */
export function LuanGiaiSkeletonCard({ steps }: LuanGiaiSkeletonCardProps) {
  const [buoc, setBuoc] = useState(0);

  useEffect(() => {
    if (!steps || steps.length <= 1) return;

    // Dừng lại ở bước cuối chứ không quay vòng: chạy hết rồi quay lại đầu trông như bị treo.
    const id = setInterval(
      () => setBuoc((hienTai) => Math.min(hienTai + 1, steps.length - 1)),
      STEP_HOLD_MS,
    );
    return () => clearInterval(id);
  }, [steps]);

  return (
    <LuanGiaiCard>
      <div aria-label="Đang tải luận giải" role="status">
        {steps ? (
          <p
            aria-live="polite"
            className="mb-6 text-center font-body text-[15px] leading-[24px] text-[#8a7a63]"
          >
            {steps[buoc]}
            <span aria-hidden className="animate-pulse motion-reduce:animate-none">
              …
            </span>
          </p>
        ) : null}

        <div className="flex items-center gap-[14px] pl-[3%]">
          <div className={cn(BLOCK_CLASS, 'size-[64px] shrink-0 rounded-full md:size-[88px]')} />
          <div className="min-w-0 flex-1">
            <div className={cn(BLOCK_CLASS, 'h-[14px] w-[110px]')} />
            <div className={cn(BLOCK_CLASS, 'mt-3 h-[28px] w-[62%] md:h-[36px]')} />
          </div>
        </div>

        <div className={cn(BLOCK_CLASS, 'mt-7 h-[22px] w-[74%]')} />

        <div className="mt-8 space-y-3">
          {LINE_WIDTHS.map((width) => (
            <div key={width} className={cn(BLOCK_CLASS, 'h-[15px]', width)} />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {LINE_WIDTHS.slice(0, 3).map((width) => (
            <div key={width} className={cn(BLOCK_CLASS, 'h-[15px]', width)} />
          ))}
        </div>
      </div>
    </LuanGiaiCard>
  );
}
