import { useEffect, useState } from 'react';
import { LuanGiaiCard } from '@/features/la-so/components/luan-giai-card';
import { cn } from '@/lib/utils';

const BLOCK_CLASS = 'rounded bg-[#e3d7ba]';
const SWEEP_CLASS = 'animate-ink-sweep motion-reduce:animate-none';

/** Bề rộng lệch nhau cho mấy vạch chờ trông như đoạn văn thật, không như bảng biểu. */
const LINE_WIDTHS = ['w-full', 'w-[96%]', 'w-[88%]', 'w-[93%]', 'w-[62%]'] as const;

const TICK_MS = 1_000;

/**
 * Đo trên bài thật: viết đạt ngay thì khoảng 7 giây, phải viết lại ba lượt thì tới 20. Thanh tiến
 * trình bò tới mốc này rồi chậm dần, không bao giờ đầy — máy chủ làm xong mới trả một lần, không có
 * đường nào báo về đang ở bước nào, nên vẽ một thanh chạy tới 100% là nói dối.
 */
const KY_VONG_GIAY = 14;
const TRAN_PHAN_TRAM = 90;

/** Dưới ngưỡng này thì nhắc tới thời gian chỉ tổ làm người ta để ý là phải chờ. */
const BAT_DAU_DEM_GIAY = 8;

/** Mỗi chừng này giây hiện thêm một vạch chữ, cho cảm giác bài đang được viết dần. */
const GIAY_MOI_VACH = 2;

interface LuanGiaiSkeletonCardProps {
  /**
   * Bật khi thực sự đang viết bài. Đọc bài đã có thì xong trong tích tắc, hiện thông điệp chờ ở đó
   * là nói sai việc đang diễn ra.
   */
  readonly isWriting?: boolean;
}

/** Khung chờ dựng theo đúng bố cục thẻ bài, để lúc nội dung về không bị nhảy layout. */
export function LuanGiaiSkeletonCard({ isWriting }: LuanGiaiSkeletonCardProps) {
  const [giay, setGiay] = useState(0);

  useEffect(() => {
    if (!isWriting) return;

    const id = setInterval(() => setGiay((truoc) => truoc + TICK_MS / 1_000), TICK_MS);
    return () => clearInterval(id);
  }, [isWriting]);

  // Tiệm cận trần chứ không tuyến tính: chờ càng lâu thanh càng bò chậm, nên quá hẹn vẫn không kẹt
  // ở một con số đứng im.
  const phanTram = Math.round(TRAN_PHAN_TRAM * (1 - Math.exp(-giay / KY_VONG_GIAY)));
  const soVach = isWriting
    ? Math.min(LINE_WIDTHS.length, 1 + Math.floor(giay / GIAY_MOI_VACH))
    : LINE_WIDTHS.length;

  return (
    <LuanGiaiCard>
      <div aria-label="Đang tải luận giải" role="status">
        {isWriting ? (
          <div className="mb-7">
            <p
              aria-live="polite"
              className="text-center font-body text-[15px] leading-[24px] text-[#6b5a4e]"
            >
              Đang viết luận giải cho lá số của bạn
              {giay >= BAT_DAU_DEM_GIAY ? (
                <span className="text-[#8a7a63]"> · {Math.round(giay)} giây rồi</span>
              ) : null}
            </p>
            <p className="mt-1 text-center font-body text-[13px] text-[#8a7a63]">
              Mỗi bài viết riêng cho lá số này, thường mất 10–20 giây
            </p>

            <div
              aria-label="Tiến trình viết bài"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={phanTram}
              className="mx-auto mt-4 h-[3px] w-[62%] overflow-hidden rounded-full bg-[#e3d7ba]"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-[#b08b4f] transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                style={{ width: `${phanTram}%` }}
              />
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-[14px] pl-[3%]">
          <div
            className={cn(
              BLOCK_CLASS,
              SWEEP_CLASS,
              'size-[64px] shrink-0 rounded-full md:size-[88px]',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-[14px] w-[110px]')} />
            <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'mt-3 h-[28px] w-[62%] md:h-[36px]')} />
          </div>
        </div>

        <div className={cn(BLOCK_CLASS, SWEEP_CLASS, 'mt-7 h-[22px] w-[74%]')} />

        <div className="mt-8 space-y-3">
          {LINE_WIDTHS.slice(0, soVach).map((width) => (
            <div key={width} className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-[15px]', width)} />
          ))}
        </div>

        {!isWriting ? (
          <div className="mt-8 space-y-3">
            {LINE_WIDTHS.slice(0, 3).map((width) => (
              <div key={width} className={cn(BLOCK_CLASS, SWEEP_CLASS, 'h-[15px]', width)} />
            ))}
          </div>
        ) : null}
      </div>
    </LuanGiaiCard>
  );
}
