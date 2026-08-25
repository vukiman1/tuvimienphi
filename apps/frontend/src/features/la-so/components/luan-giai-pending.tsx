import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { ImagePlaceholder } from '@/features/la-so/components/image-placeholder';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';

interface LuanGiaiPendingCardProps {
  readonly chapter: LuanGiaiChapter;
}

/** Thẻ cho mục chưa biên soạn: giữ nguyên khung giấy để đổi mục không làm nhảy bố cục. */
export function LuanGiaiPendingCard({ chapter }: LuanGiaiPendingCardProps) {
  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader order={chapter.order} title={chapter.title} />

      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 py-10 text-center">
        <ImagePlaceholder
          className="size-[96px] opacity-55"
          label="Icon"
          ratio="1 / 1"
          src={chapter.iconUrl}
        />
        <p className="font-display text-[22px] leading-[30px] font-semibold text-[#7a1f15]">
          Nội dung đang được biên soạn
        </p>
        <p className="max-w-[46ch] font-body text-[16px] leading-[27px] text-[#6b6152]">
          Phần luận giải cho mục này sẽ sớm có mặt. Trong lúc chờ, bạn có thể xem mục{' '}
          <span className="font-semibold text-[#2b2114]">Thân cư</span> hoặc rê chuột lên lá số để
          xem tam hợp và xung chiếu của từng cung.
        </p>
      </div>
    </LuanGiaiCard>
  );
}
