import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { MEDIA } from '@/config/media';
import { KNOWLEDGE_SECTION } from '@/features/home/home-content';

const HEADING_ID = 'home-knowledge-title';

/** Dải nền chạy hết bề ngang màn hình, thoát khỏi lề của trang. */
const FULL_BLEED = { marginLeft: 'calc(50% - 50vw)', width: '100vw' } as const;

/** Giấy cổ phủ kín dải; màu nền giữ lại làm lớp đỡ khi ảnh chưa về. */
const PAPER = {
  backgroundImage: `url('${MEDIA.home.knowledgePaper}')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundColor: '#f7eeda',
} as const;

/** Khoảng lệch giữa hai dòng bài khi cả nhóm cùng hiện ra. */
const STAGGER_MS = 90;

/**
 * Chưa có bài viết nào đứng sau thì dẫn về trang kiến thức. Tách riêng vì `to` của router là kiểu
 * literal — viết một `<Link>` rồi đổi `to` bằng biểu thức ba ngôi sẽ mất kiểm tra kiểu.
 */
function ArticleLink({
  slug,
  className,
  children,
}: {
  readonly slug: string | undefined;
  readonly className: string;
  readonly children: ReactNode;
}) {
  if (slug === undefined) {
    return (
      <Link className={className} to="/kien-thuc">
        {children}
      </Link>
    );
  }
  return (
    <Link className={className} params={{ slug }} to="/kien-thuc/$slug">
      {children}
    </Link>
  );
}

export function KnowledgeSection() {
  const { featured } = KNOWLEDGE_SECTION;

  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden"
      style={{ ...FULL_BLEED, ...PAPER }}
    >
      <div className="relative mx-auto w-full max-w-[1360px] px-4 py-[56px] md:px-6 md:py-[76px]">
        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div>
              <h2
                className="font-body text-[28px] leading-[38px] font-bold text-[#2a1f0e] md:text-[42px] md:leading-[54px]"
                id={HEADING_ID}
              >
                {KNOWLEDGE_SECTION.title}
              </h2>
              <p className="mt-3 max-w-[720px] font-ui text-[15px] leading-[24px] text-[#6b5a44] md:text-[16px] md:leading-[26px]">
                {KNOWLEDGE_SECTION.subtitle}
              </p>
            </div>

            <Link
              className="group inline-flex shrink-0 items-center gap-2 pt-1 font-ui text-[15px] leading-[22px] font-semibold text-[#8a6420] no-underline transition-colors outline-none hover:text-[#5f440f] focus-visible:ring-2 focus-visible:ring-[#8a6420]"
              to="/kien-thuc"
            >
              {KNOWLEDGE_SECTION.ctaLabel}
              {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-4` thành 22px, to hơn hẳn chữ. */}
              <ArrowRight
                aria-hidden
                className="size-[16px] transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
            </Link>
          </div>
        </Reveal>

        <div className="mt-9 grid gap-6 md:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,470px)] lg:gap-8">
          <Reveal delay={80}>
            <ArticleLink
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e0cba6] bg-[#fffdf7]/80 no-underline transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[#d0a75f] hover:shadow-[0_14px_30px_rgba(160,116,45,0.18)] focus-visible:ring-2 focus-visible:ring-[#8a6420] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:flex-row"
              slug={featured.slug}
            >
              <span className="relative block shrink-0 overflow-hidden bg-[#efe4cd] sm:w-[46%]">
                <img
                  alt=""
                  aria-hidden
                  className="h-full max-h-[280px] w-full object-cover object-[52%_72%] transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:max-h-none"
                  loading="lazy"
                  src={MEDIA.laSo.historyPavilionPine}
                />
                <span className="absolute top-4 left-4 rounded-full bg-[linear-gradient(180deg,#f2d79f_0%,#dcb268_100%)] px-4 py-1.5 font-ui text-[13px] leading-[18px] font-bold text-[#3d2408]">
                  {KNOWLEDGE_SECTION.featuredBadge}
                </span>
              </span>

              <span className="flex min-w-0 flex-1 flex-col p-6 md:p-7">
                <span className="block font-body text-[21px] leading-[30px] font-bold text-[#2a1f0e] md:text-[24px] md:leading-[34px]">
                  {featured.title}
                </span>
                <span className="mt-3 block font-ui text-[14px] leading-[22px] text-[#6b5a44] md:text-[15px] md:leading-[24px]">
                  {featured.excerpt}
                </span>
                <span className="mt-auto flex items-end justify-between gap-4 pt-6">
                  <span className="font-ui text-[13px] leading-[20px] text-[#8b7a62]">
                    {featured.date}
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-[18px] shrink-0 text-[#8a6420] transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  />
                </span>
              </span>
            </ArticleLink>
          </Reveal>

          <ul className="flex flex-col gap-1.5">
            {KNOWLEDGE_SECTION.more.map((item, index) => (
              <li key={item.title}>
                <Reveal delay={160 + index * STAGGER_MS}>
                  <ArticleLink
                    className="group -mx-3 flex items-center gap-4 rounded-2xl border border-transparent px-3 py-1 no-underline transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#e0cba6] hover:bg-[#fffdf7]/80 focus-visible:ring-2 focus-visible:ring-[#8a6420] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    slug={item.slug}
                  >
                    <span className="block w-[104px] shrink-0 overflow-hidden rounded-xl bg-[#efe4cd] md:w-[112px]">
                      <img
                        alt=""
                        aria-hidden
                        className="aspect-[16/10] w-full object-cover object-[52%_72%] transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        loading="lazy"
                        src={MEDIA.laSo.historyPavilionPine}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-body text-[15px] leading-[22px] font-semibold text-[#2a1f0e] md:text-[16px] md:leading-[23px]">
                        {item.title}
                      </span>
                      <span className="mt-1 block font-ui text-[12px] leading-[18px] text-[#8b7a62]">
                        {item.date}
                      </span>
                    </span>
                  </ArticleLink>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
