import { Fragment, useState } from 'react';
import { MEDIA } from '@/config/media';
import type { LuanGiai } from '@/features/la-so/luan-giai-data';
import { LuanGiaiChapterContent } from '@/features/la-so/components/luan-giai-chapter-content';
import { LuanGiaiChapters } from '@/features/la-so/components/luan-giai-chapters';
import { cn } from '@/lib/utils';

interface LuanGiaiSectionProps {
  readonly luanGiai: LuanGiai;
  readonly activeChapter: string;
  readonly onSelectChapter: (order: string) => void;
}

/** Dải đỏ chạy hết bề ngang màn hình, thoát khỏi lề của `main`. Phần thừa do `100vw` tính cả thanh
 *  cuộn được `overflow-x: clip` ở gốc layout `_site` cắt đi. */
const FULL_BLEED = { marginLeft: 'calc(50% - 50vw)', width: '100vw' } as const;

/**
 * Hai cụm mây nhỏ nép sát mép trái và mép phải, cưỡi lên đường nối hai nền cho chỗ giáp ranh đỡ
 * cắt ngang phè. Cụm bên phải là chính ảnh đó lật ngang, khỏi phải xuất thêm file.
 */
function SeamCloud({ side }: { readonly side: 'left' | 'right' }) {
  return (
    <img
      alt=""
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-0 w-[16%] max-w-[260px] min-w-[150px] -translate-y-1/2 select-none',
        side === 'left' ? 'left-0' : 'right-0 -scale-x-100',
      )}
      src={MEDIA.laSo.cloudDivider}
    />
  );
}

/**
 * Ảnh gốc có hình thoi bên trái và đường vuốt chạy sang phải, nên vế trái của tiêu đề phải lật
 * ngang để hình thoi luôn nằm sát chữ còn đường vuốt hướng ra ngoài.
 */
function TitleOrnament({ side }: { readonly side: 'left' | 'right' }) {
  return (
    <span aria-hidden className="hidden min-w-0 flex-1 sm:block">
      <img
        alt=""
        // Ảnh tỉ lệ 3:1 nhưng nét vẽ chỉ chiếm phần giữa; để `h-auto` thì hàng tiêu đề cao 104px
        // toàn khoảng trong suốt. `object-cover` xén phần rỗng trên dưới, giữ nguyên bề ngang nét.
        className={cn(
          'h-[44px] w-full object-cover select-none',
          side === 'left' && '-scale-x-100',
        )}
        src={MEDIA.laSo.headerOrnament}
      />
    </span>
  );
}

export function LuanGiaiSection({
  luanGiai,
  activeChapter,
  onSelectChapter,
}: LuanGiaiSectionProps) {
  // Mục lục và nội dung luôn khớp nhau: khoá lạ thì rơi về mục đầu chứ không để trống thân trang.
  const chapter =
    luanGiai.chapters.find((item) => item.order === activeChapter) ?? luanGiai.chapters[0];

  // Giữ ở đây chứ không giữ trong thẻ: đổi sang mục khác rồi quay lại thì không phải bấm xem lần nữa.
  const [requestedOrders, setRequestedOrders] = useState<readonly string[]>([]);

  return (
    <section
      // pt ghi bằng px: root font-size 137.5% biến `pt-16` thành 88px, cao hơn hẳn ý đồ.
      className="relative mt-24 bg-[#7a1f15] pt-[52px] pb-10 md:pt-[64px] md:pb-14"
      style={FULL_BLEED}
    >
      <SeamCloud side="left" />
      <SeamCloud side="right" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <h2 className="mx-auto flex max-w-[1000px] items-center justify-center gap-5 font-display text-[30px] leading-[38px] font-bold tracking-[0.06em] text-[#e2c186] uppercase md:text-[36px] md:leading-[44px]">
          <TitleOrnament side="left" />
          <span className="shrink-0">Luận giải lá số</span>
          <TitleOrnament side="right" />
        </h2>

        {/* Mục lục đặt ngay dưới tiêu đề: người đọc thấy có những gì rồi mới chọn, thay vì phải
            lướt hết bài mới tới chỗ đổi mục. */}
        <div className="mx-auto mt-8 max-w-[1100px]">
          <LuanGiaiChapters
            activeOrder={activeChapter}
            chapters={luanGiai.chapters}
            onSelect={onSelectChapter}
          />
        </div>

        {/* Giới hạn bề ngang: dòng chữ dài quá 90 ký tự là mất mạch đọc. */}
        <div className="mx-auto mt-6 max-w-[1100px]">
          <LuanGiaiChapterContent
            chapter={chapter}
            isRequested={requestedOrders.includes(chapter.order)}
            onRequest={() => setRequestedOrders((current) => [...current, chapter.order])}
          />
        </div>

        {/*
          Ba phần tử ngang hàng chứ không lồng nhau: khi hẹp thì thái cực tự xuống một hàng riêng và
          nằm giữa, thay vì bị dính vào vế sau.
        */}
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-[10px] gap-y-2 text-center font-body text-[14px] leading-[21px] text-[#e8cd97]">
          {luanGiai.motto.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && (
                // `basis-full` đặt ở khung bọc chứ không đặt lên ảnh: đặt thẳng lên ảnh thì nó ép
                // bề rộng ảnh bằng cả hàng và kéo thái cực dẹt ra.
                <span className="flex basis-full justify-center md:basis-auto">
                  <img
                    alt=""
                    aria-hidden
                    // Chiều rộng để `auto`: ảnh đã cắt sát nét nên tự ra đúng tỉ lệ, khỏi lo méo.
                    className="h-[62px] w-auto select-none md:h-[76px]"
                    src={MEDIA.laSo.taiji}
                  />
                </span>
              )}
              <span>{line}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
