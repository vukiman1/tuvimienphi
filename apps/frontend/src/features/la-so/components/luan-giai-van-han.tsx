import { useState } from 'react';
import type { VanHanScale } from '@/features/la-so/luan-giai-data';
import { LuanGiaiAccordion } from '@/features/la-so/components/luan-giai-accordion';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';
import { cn } from '@/lib/utils';

interface LuanGiaiVanHanCardProps {
  readonly order: string;
  readonly title: string;
  readonly scales: readonly VanHanScale[];
}

/**
 * Bốn lát cắt thời gian loại trừ nhau nên cho chọn chứ không cho chảy liền. Trong mỗi lát thì mốc
 * lại nhiều — đại vận trải hết mười hai cung — nên mốc dùng thẻ gập, mốc đang có hiệu lực mở sẵn.
 */
export function LuanGiaiVanHanCard({ order, title, scales }: LuanGiaiVanHanCardProps) {
  const [activeSlug, setActiveSlug] = useState(scales[0].slug);
  const scale = scales.find((item) => item.slug === activeSlug) ?? scales[0];

  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader eyebrow="Theo thời gian" order={order} title={title} />

      <div aria-label="Lát cắt thời gian" className="mt-5 flex flex-wrap gap-2" role="tablist">
        {scales.map((item) => (
          <button
            key={item.slug}
            aria-selected={item.slug === activeSlug}
            className={cn(
              'rounded-full border px-[18px] py-[7px] font-body text-[15px] leading-[21px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#a8281c]',
              item.slug === activeSlug
                ? 'border-[#a8281c] bg-[#a8281c] text-[#f5e8d0]'
                : 'border-[#c9a15c]/70 bg-[#f4ecd9] text-[#7a1f15] hover:bg-[#efe2c4]',
            )}
            onClick={() => setActiveSlug(item.slug)}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Khoá theo lát cắt để mỗi lần đổi lát là dựng lại danh sách: trạng thái mở của lát cũ không
          dính sang lát mới, và mốc đang có hiệu lực của lát mới được mở sẵn. */}
      <LuanGiaiAccordion
        key={scale.slug}
        defaultOpenId={scale.currentSlug}
        entries={scale.periods.map((period) => ({
          id: period.slug,
          title: period.range,
          meta: `${period.years} · ${period.cung}`,
          badge: period.slug === scale.currentSlug ? 'Đang đi' : undefined,
          paragraphs: period.paragraphs,
        }))}
      />
    </LuanGiaiCard>
  );
}
