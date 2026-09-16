import type { LuanGiaiArticle } from '@org/shared-contracts';
import { ImagePlaceholder } from '@/features/la-so/components/image-placeholder';
import { LuanGiaiAccordion } from '@/features/la-so/components/luan-giai-accordion';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';
import { RichText } from '@/features/la-so/components/rich-text';
import { cn } from '@/lib/utils';

interface LuanGiaiArticleCardProps {
  readonly article: LuanGiaiArticle;
  readonly order: string;
  /**
   * Bật cho bài vừa viết xong: từng khối hiện dần thay vì đổ ra một lượt. Mở lại bài đã lưu thì
   * tắt — lúc đó không có gì đang được viết, diễn tiếp là nói sai việc đang diễn ra.
   */
  readonly isFresh?: boolean;
}

/** Lệch nhau vừa đủ thấy là hiện lần lượt, cả bài vẫn xong dưới một giây. */
const REVEAL_STEP_MS = 110;

/**
 * Tranh thuỷ mặc tan dần vào nền thay vì đóng khung: giao hai dải chuyển sắc, một mờ về bên phải,
 * một mờ xuống đáy, nên rìa trong của tranh nhạt hẳn — chỗ chữ chảy vào.
 */
const INK_FADE = [
  'linear-gradient(to right, black 58%, transparent 100%)',
  'linear-gradient(to bottom, black 72%, transparent 100%)',
].join(', ');

const INK_WASH_MASK = {
  maskImage: INK_FADE,
  maskComposite: 'intersect',
  WebkitMaskImage: INK_FADE,
  WebkitMaskComposite: 'source-in',
} as const;

export function LuanGiaiArticleCard({ article, order, isFresh }: LuanGiaiArticleCardProps) {
  const hienDan = (thuTu: number) =>
    isFresh
      ? {
          className: 'animate-block-in motion-reduce:animate-none',
          style: { animationDelay: `${thuTu * REVEAL_STEP_MS}ms` },
        }
      : { className: '', style: undefined };

  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader eyebrow={article.eyebrow} order={order} title={article.title} />

      <div className="mt-4 flex items-center gap-6 md:pl-[12%]">
        <blockquote // Từ lg trở lên không cho co: còn chỗ thì trích dẫn phải nằm trọn một dòng.
          className={cn(
            'font-display text-[21px] leading-[32px] font-bold text-[#2b2114] italic lg:shrink-0',
            hienDan(0).className,
          )}
          style={hienDan(0).style}
        >
          “{article.quote}”
        </blockquote>
        <span aria-hidden className="hidden h-px flex-1 bg-[#c9a15c]/60 lg:block" />
      </div>

      {/* Vùng thân bài: có tranh thì tranh neo tuyệt đối bên trái và tràn ra ngoài, chữ dồn sang
          cột phải. Bài không có tranh thì chữ chiếm trọn bề ngang, không chừa cột trống. */}
      <div className="relative mt-6">
        {article.illustrationUrl && (
          <figure className="pointer-events-none mb-3 -ml-8 w-[72%] md:absolute md:-bottom-7 md:left-[-18%] md:mb-0 md:ml-0 md:w-[52%]">
            <img
              alt=""
              aria-hidden
              className="h-auto w-full select-none"
              src={article.illustrationUrl}
              style={INK_WASH_MASK}
            />
          </figure>
        )}

        <div className={cn('relative', article.illustrationUrl && 'md:ml-[36%]')}>
          <h4
            className={cn(
              'font-display text-[23px] leading-[30px] font-bold text-[#7a1f15]',
              hienDan(1).className,
            )}
            style={hienDan(1).style}
          >
            {article.subheading}
          </h4>

          {article.paragraphs.map((paragraph, thuTu) => (
            <p
              key={paragraph.slice(0, 40)}
              className={cn(
                'mt-4 font-body text-justify text-[17px] leading-[29px] text-[#2b2114]',
                hienDan(2 + thuTu).className,
              )}
              style={hienDan(2 + thuTu).style}
            >
              <RichText text={paragraph} />
            </p>
          ))}

          {article.sections && (
            <LuanGiaiAccordion
              entries={article.sections.map((section) => ({
                id: section.slug,
                title: section.title,
                meta: section.sourceCung,
                paragraphs: section.paragraphs,
              }))}
            />
          )}

          <p
            className={cn(
              'mt-5 border border-[#c9a15c]/70 bg-[#f4ecd9] px-6 py-5 text-center font-body text-[17px] leading-[29px] text-[#2b2114]',
              hienDan(2 + article.paragraphs.length).className,
            )}
            style={hienDan(2 + article.paragraphs.length).style}
          >
            <RichText text={article.summary} />
          </p>

          <footer
            className={cn(
              'mt-6 flex items-end justify-between gap-6',
              hienDan(3 + article.paragraphs.length).className,
            )}
            style={hienDan(3 + article.paragraphs.length).style}
          >
            <div className="min-w-0">
              <p className="font-display text-[15px] leading-[20px] font-medium text-[#8d6f42] italic">
                {article.closingLabel}
              </p>
              <p className="mt-1 font-display text-[21px] leading-[30px] font-semibold text-[#a8281c] italic">
                {article.closing}
              </p>
            </div>
            <ImagePlaceholder
              className="size-[56px] shrink-0 md:size-[74px]"
              label="Ấn triện"
              ratio="1 / 1"
              src={article.sealUrl}
            />
          </footer>
        </div>
      </div>
    </LuanGiaiCard>
  );
}
