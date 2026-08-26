import type { ReactNode } from 'react';
import { MEDIA } from '@/config/media';

interface LuanGiaiCardProps {
  readonly children: ReactNode;
}

/** Khung giấy hai viền dùng chung cho mọi mục luận giải, đã biên soạn hay còn để trống. */
export function LuanGiaiCard({ children }: LuanGiaiCardProps) {
  return (
    // Không đặt overflow-hidden: tranh phải tràn được ra ngoài khung thẻ.
    <article className="relative border border-[#c9a15c] bg-[#faf6ec] p-[6px]">
      {/*
        Hoa văn la kinh chìm dưới nền. Có khung cắt riêng vì bản thân thẻ cố ý không cắt tràn —
        tranh hạc còn phải thò ra ngoài mép.
      */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          alt=""
          className="absolute top-1/2 left-1/2 w-[50%] max-w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-[0.07] select-none"
          src={MEDIA.laSo.luopan}
        />
      </span>

      <div className="relative border border-[#c9a15c]/45 px-5 pt-8 pb-7 md:px-10">{children}</div>
    </article>
  );
}

interface LuanGiaiCardHeaderProps {
  readonly order: string;
  readonly title: string;
  readonly eyebrow?: string;
}

export function LuanGiaiCardHeader({ order, title, eyebrow }: LuanGiaiCardHeaderProps) {
  return (
    <header className="flex items-center gap-[14px] pl-[3%]">
      {/* Khung huy hiệu là ảnh trống dùng chung cho mọi mục, số thứ tự vẽ đè lên bằng chữ. */}
      <span className="relative flex size-[64px] shrink-0 items-center justify-center md:size-[88px]">
        <img
          alt=""
          aria-hidden
          className="absolute inset-0 size-full select-none"
          src={MEDIA.laSo.badge}
        />
        {/* lining-nums: Cormorant Garamond mặc định dùng chữ số kiểu cổ, cao bằng chữ thường nên
            "01" đọc ra như "oi". */}
        <span className="relative font-display text-[37px] leading-none font-bold text-[#f5e8d0] lining-nums md:text-[50px]">
          {order}
        </span>
      </span>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[14px] font-semibold tracking-[0.3em] text-[#a8281c] uppercase">
            {eyebrow}
          </p>
        )}
        <h3 className="font-display text-[24px] leading-[30px] font-bold tracking-wide text-[#7a1f15] uppercase md:text-[34px] md:leading-[42px]">
          {title}
        </h3>
      </div>
    </header>
  );
}
