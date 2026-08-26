import { LuanGiaiCard } from '@/features/la-so/components/luan-giai-card';
import { cn } from '@/lib/utils';

const BLOCK_CLASS = 'animate-pulse rounded bg-[#e3d7ba] motion-reduce:animate-none';

/** Bề rộng lệch nhau cho mấy vạch chờ trông như đoạn văn thật, không như bảng biểu. */
const LINE_WIDTHS = ['w-full', 'w-[96%]', 'w-[88%]', 'w-[93%]', 'w-[62%]'] as const;

/** Khung chờ dựng theo đúng bố cục thẻ bài, để lúc nội dung về không bị nhảy layout. */
export function LuanGiaiSkeletonCard() {
  return (
    <LuanGiaiCard>
      <div aria-label="Đang tải luận giải" role="status">
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
