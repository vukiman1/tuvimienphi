import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { MEDIA, homeIconUrl } from '@/config/media';
import { UNDERSTANDING_SECTION } from '@/features/home/home-content';

const HEADING_ID = 'home-understanding-title';

const CONTENT_MAX_WIDTH = 1120;

/** Dải tối chạy hết bề ngang màn hình, thoát khỏi lề của trang. */
const FULL_BLEED = { marginLeft: 'calc(50% - 50vw)', width: '100vw' } as const;

/** Đen thuần, chỉ hơi nhấc sáng quanh chỗ đặt ảnh để thiên hà không dán lên một mảng phẳng lì. */
const NIGHT_SKY = 'radial-gradient(120% 120% at 78% 45%, #0d0d10 0%, #050506 45%, #000000 100%)';

/**
 * Sao vẽ bằng hai lớp chấm tròn thưa thay vì ảnh nền: vùng này phải giãn hết bề ngang mọi màn hình,
 * mà ảnh sao tile lên thì lộ đường lặp.
 */
const STARFIELD = [
  'radial-gradient(1.5px 1.5px at 12% 22%, rgba(255,255,255,0.55) 50%, transparent 50%)',
  'radial-gradient(1px 1px at 34% 68%, rgba(255,255,255,0.4) 50%, transparent 50%)',
  'radial-gradient(1.5px 1.5px at 58% 18%, rgba(255,255,255,0.45) 50%, transparent 50%)',
  'radial-gradient(1px 1px at 8% 76%, rgba(255,255,255,0.35) 50%, transparent 50%)',
  'radial-gradient(1px 1px at 44% 40%, rgba(255,255,255,0.3) 50%, transparent 50%)',
].join(', ');

const EDGE_FADE_GRADIENT = 'linear-gradient(to right, transparent 0%, black 26%)';

const EDGE_FADE = {
  maskImage: EDGE_FADE_GRADIENT,
  WebkitMaskImage: EDGE_FADE_GRADIENT,
} as const;

/**
 * Kích thước thật của file. Bắt buộc phải khai: ảnh neo tuyệt đối và để `w-auto`, nên trước khi tải
 * xong bề rộng của nó tính ra 0 — hộp 0px nằm sát mép phải thường rơi ngoài ngưỡng mà trình duyệt
 * dùng để quyết định nạp ảnh `lazy`, và ảnh không bao giờ hiện.
 */
const READER_SIZE = { width: 1000, height: 672 } as const;

/**
 * Dải nền chạy hết bề ngang màn hình còn chữ thì gói trong khung 1120px căn giữa, nên neo ảnh vào
 * `right: 0` sẽ dán nó vào mép màn hình và càng màn rộng thì càng rời xa chữ. Lùi vào đúng nửa
 * phần thừa để mép phải ảnh luôn trùng mép khung chữ.
 */
const READER_ANCHOR = { right: `calc(50% - ${CONTENT_MAX_WIDTH / 2}px)` } as const;

export function UnderstandingSection() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden"
      style={{ ...FULL_BLEED, background: NIGHT_SKY }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: STARFIELD }}
      />

      {/* Ảnh neo tuyệt đối bên phải, chặn bề ngang để dải nút bên trái không bị thiên hà đè lên.
          Mép trái nhoè dần cho ảnh tan vào nền thay vì đứng thành một khối chữ nhật. */}
      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 hidden h-full w-auto max-w-[620px] object-contain object-right-bottom select-none lg:block"
        height={READER_SIZE.height}
        loading="lazy"
        src={MEDIA.home.readerGalaxy}
        style={{ ...EDGE_FADE, ...READER_ANCHOR }}
        width={READER_SIZE.width}
      />

      <div className="relative mx-auto w-full max-w-[1120px] px-4 py-[52px] md:px-6 md:py-[64px]">
        <h2
          className="font-display text-3xl font-bold tracking-wide text-[#e8c887] uppercase md:text-4xl"
          id={HEADING_ID}
        >
          {UNDERSTANDING_SECTION.title}
        </h2>

        <div className="mt-9 flex flex-col gap-9 md:mt-11 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)_minmax(0,300px)] lg:items-center lg:gap-10">
          <ul className="flex flex-col gap-6">
            {UNDERSTANDING_SECTION.points.map((point) => (
              <li className="flex items-start gap-4" key={point.icon}>
                <img
                  alt=""
                  aria-hidden
                  className="mt-[2px] size-[38px] shrink-0 select-none"
                  loading="lazy"
                  src={homeIconUrl(point.icon)}
                />
                <div className="min-w-0">
                  <p className="font-body text-[15px] leading-[22px] font-semibold text-[#f3ead8]">
                    {point.title}
                  </p>
                  <p className="mt-1 font-body text-[14px] leading-[21px] text-[#a9b0c9]">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <nav aria-label="Bài viết về cách hiểu tử vi" className="flex flex-col gap-4">
            {UNDERSTANDING_SECTION.links.map((link) => (
              <Link
                key={link.label}
                className="flex items-center justify-between gap-4 rounded-lg border border-[#c9a15c]/60 bg-black/65 px-5 py-3 font-body text-[15px] leading-[22px] font-medium text-[#f3ead8] no-underline transition-colors outline-none hover:border-[#e8c887] hover:bg-[#c9a15c]/15 focus-visible:ring-2 focus-visible:ring-[#e8c887]"
                to={link.to}
              >
                {link.label}
                {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-4` thành 22px, to hơn hẳn chữ. */}
                <ArrowRight aria-hidden className="size-[18px] shrink-0 text-[#e8c887]" />
              </Link>
            ))}
          </nav>

          {/* Cột rỗng giữ chỗ cho ảnh neo tuyệt đối, để chữ không chạy xuống dưới nó. */}
          <span aria-hidden className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
