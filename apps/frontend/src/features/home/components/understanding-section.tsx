import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { MEDIA, homeIconUrl } from '@/config/media';
import { UNDERSTANDING_SECTION } from '@/features/home/home-content';
import { cn } from '@/lib/utils';

const HEADING_ID = 'home-understanding-title';

/** Dải nền chạy hết bề ngang màn hình, thoát khỏi lề của trang. */
const FULL_BLEED = { marginLeft: 'calc(50% - 50vw)', width: '100vw' } as const;

/**
 * Tranh trời sao phủ kín dải. `#070a14` giữ lại làm lớp đỡ: ảnh nặng và nạp muộn, mà chữ ở đây là
 * chữ sáng — nền trắng trong lúc chờ sẽ loá và đọc không ra.
 */
const NIGHT_SKY = {
  backgroundImage: `url('${MEDIA.home.understandingSky}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#070a14',
} as const;

/** Màn phủ mỏng, chỉ 10% — vừa đủ giữ chữ đọc được mà tranh gần như nguyên bản. */
const SCRIM = 'rgba(4, 7, 15, 0.1)';

/** Khoảng lệch giữa hai cột khi cả ba cùng hiện ra. */
const STAGGER_MS = 110;

export function UnderstandingSection() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden"
      style={{ ...FULL_BLEED, ...NIGHT_SKY }}
    >
      <span aria-hidden className="absolute inset-0" style={{ backgroundColor: SCRIM }} />

      <div className="relative mx-auto w-full max-w-[1360px] px-4 py-[56px] md:px-6 md:py-[76px]">
        <Reveal>
          <h2
            className="font-body text-[28px] leading-[38px] font-bold text-[#e8c887] md:text-[42px] md:leading-[54px]"
            id={HEADING_ID}
          >
            {UNDERSTANDING_SECTION.title}
          </h2>
          <p className="mt-3 max-w-[760px] font-ui text-[15px] leading-[24px] text-[#c3c9dd] md:text-[17px] md:leading-[27px]">
            {UNDERSTANDING_SECTION.subtitle}
          </p>
        </Reveal>

        {/*
          Vạch ngăn vẽ bằng viền trái của cột thứ hai trở đi, nên nó tự biến mất khi lưới rút về
          một cột — dùng `divide-x` thì viền vẫn còn và nằm chỏng chơ bên trái từng cột.
        */}
        <ul className="mt-10 grid gap-10 md:mt-14 md:grid-cols-3 md:gap-0">
          {UNDERSTANDING_SECTION.points.map((point, index) => (
            <li
              className={cn(
                'md:pr-8 lg:pr-10',
                index > 0 && 'md:border-l md:border-[#c9a15c]/30 md:pl-8 lg:pl-10',
              )}
              key={point.icon}
            >
              <Reveal className="h-full" delay={index * STAGGER_MS}>
                {/* `mt-auto` ở link đẩy nó xuống đáy cột, để ba link thẳng hàng dù mô tả dài ngắn
                    khác nhau — cột phải căng hết chiều cao hàng thì mới có đáy để đẩy tới. */}
                <div className="group flex h-full flex-col items-start">
                  <img
                    alt=""
                    aria-hidden
                    className="size-[54px] shrink-0 transition-transform duration-300 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:size-[62px]"
                    loading="lazy"
                    src={homeIconUrl(point.icon)}
                  />

                  <p className="mt-5 font-body text-[18px] leading-[26px] font-bold text-[#f3ead8] md:text-[19px] md:leading-[28px]">
                    {point.title}
                  </p>
                  <p className="mt-2 font-ui text-[14px] leading-[22px] text-[#a9b0c9] md:text-[15px] md:leading-[24px]">
                    {point.description}
                  </p>

                  <Link
                    className="mt-auto inline-flex items-center gap-2 pt-6 font-ui text-[14px] leading-[20px] font-semibold text-[#e8c887] no-underline transition-colors outline-none hover:text-[#f7dda6] focus-visible:ring-2 focus-visible:ring-[#e8c887] md:text-[15px]"
                    to={point.to}
                  >
                    {point.linkLabel}
                    {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-4` thành 22px, to hơn hẳn chữ. */}
                    <ArrowRight
                      aria-hidden
                      className="size-[16px] transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                    />
                  </Link>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
