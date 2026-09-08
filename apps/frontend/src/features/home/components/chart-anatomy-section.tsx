import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/reveal';
import { HERO_SECTION_ID } from '@/features/home/components/hero-section';
import { SectionHeading } from '@/features/home/components/section-heading';
import { MEDIA, homeIconUrl } from '@/config/media';
import { CHART_ANATOMY_SECTION } from '@/features/home/home-content';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';

const HEADING_ID = 'home-chart-anatomy-title';

/** Ba thẻ đầu đứng bên trái lá số, ba thẻ sau bên phải. */
const CARDS_PER_SIDE = 3;

const LEFT_CARDS = CHART_ANATOMY_SECTION.cards.slice(0, CARDS_PER_SIDE);
const RIGHT_CARDS = CHART_ANATOMY_SECTION.cards.slice(CARDS_PER_SIDE);

type Card = (typeof CHART_ANATOMY_SECTION.cards)[number];

const DECOR_CLASS = 'pointer-events-none absolute select-none';

/** Kích thước thật của file, để trình duyệt giữ chỗ trước khi ảnh về. */
const CHART_SIZE = { width: 1120, height: 782 } as const;

/** Khoảng lệch giữa hai thẻ liền nhau khi cả nhóm cùng hiện ra. */
const STAGGER_MS = 90;

/**
 * Thẻ tách làm hai lớp vì hai chuyển động có nhịp khác hẳn nhau: `li` lo phần hiện ra (700ms, chạy
 * đúng một lần), `div` bên trong lo phần rê chuột (200ms, chạy đi chạy lại). Gộp vào một thẻ thì
 * một trong hai phải chịu nhịp của cái kia, mà cả hai đều dịch theo trục Y nên còn giẫm lên nhau
 * khi vừa hiện vừa rê.
 */
function FeatureCard({ card, delay }: { readonly card: Card; readonly delay: number }) {
  const { ref, revealed } = useScrollReveal<HTMLLIElement>();

  return (
    <li
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out will-change-transform',
        'motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none',
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
      )}
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="group flex items-center gap-4 rounded-2xl border border-[#e0cba6] bg-[#fffdf7]/85 px-5 py-4 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:border-[#d0a75f] hover:shadow-[0_12px_26px_rgba(160,116,45,0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:gap-4 md:px-5 md:py-5">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(150deg,#f7e6c4_0%,#eccf9a_100%)] transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100 md:size-[58px]">
          {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-8` thành 44px, tràn khỏi vòng tròn. */}
          <img
            alt=""
            aria-hidden
            className="size-[30px] md:size-[34px]"
            loading="lazy"
            src={homeIconUrl(card.icon)}
          />
        </span>
        <span className="min-w-0">
          <span className="block font-body text-[19px] leading-[26px] font-bold text-[#2a1f0e] md:text-[20px] md:leading-[27px]">
            {card.title}
          </span>
          <span className="mt-1.5 block font-body text-[13px] leading-[20px] text-[#6b5a44] md:text-[14px] md:leading-[21px]">
            {card.description}
          </span>
        </span>
      </div>
    </li>
  );
}

function CardColumn({
  cards,
  className,
  firstDelayIndex,
}: {
  readonly cards: readonly Card[];
  readonly className: string;
  /** Vị trí thẻ đầu nhóm trong cả sáu thẻ, để hai nhóm hiện ra so le chứ không cùng lúc. */
  readonly firstDelayIndex: number;
}) {
  return (
    <ul className={`flex flex-col gap-4 md:gap-5 ${className}`}>
      {cards.map((card, index) => (
        <FeatureCard card={card} delay={(firstDelayIndex + index) * STAGGER_MS} key={card.icon} />
      ))}
    </ul>
  );
}

export function ChartAnatomySection() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden bg-[#fdf9f0] pt-[56px] pb-[72px] md:pt-[72px] md:pb-[96px]"
    >
      <img
        alt=""
        aria-hidden
        className={`${DECOR_CLASS} top-0 right-0 w-[200px] opacity-70 md:w-[300px] lg:w-[360px]`}
        loading="lazy"
        src={MEDIA.home.decorCrane}
      />
      <img
        alt=""
        aria-hidden
        className={`${DECOR_CLASS} bottom-0 left-0 w-[260px] opacity-[0.55] sm:w-[360px] lg:w-[440px]`}
        loading="lazy"
        src={MEDIA.home.decorMountainLeft}
      />
      <img
        alt=""
        aria-hidden
        className={`${DECOR_CLASS} right-0 bottom-0 hidden w-[300px] opacity-[0.45] lg:block xl:w-[360px]`}
        loading="lazy"
        src={MEDIA.home.decorMountainRight}
      />

      <div className="relative mx-auto w-full max-w-[1480px] px-4 md:px-6">
        <Reveal>
          <SectionHeading
            id={HEADING_ID}
            subtitle={CHART_ANATOMY_SECTION.subtitle}
            title={CHART_ANATOMY_SECTION.title}
          />
        </Reveal>

        {/*
          Thứ tự trong DOM là ảnh → nhóm trái → nhóm phải, tức đúng thứ tự đọc khi cả ba xếp dọc.
          Từ `lg` mới đảo bằng `order` để lá số về giữa; làm ngược lại thì trên điện thoại lá số
          rơi xuống giữa hai nhóm thẻ.
        */}
        <div className="mt-10 md:mt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)] lg:items-center">
          <Reveal className="lg:order-2" delay={120}>
            <img
              alt="Lá số tử vi mẫu, mười hai cung dựng như một tấm bình phong"
              className="mx-auto w-full max-w-[520px] transition-transform duration-500 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100 lg:max-w-[680px]"
              height={CHART_SIZE.height}
              loading="lazy"
              src={MEDIA.home.chartScreen}
              width={CHART_SIZE.width}
            />
          </Reveal>

          {/*
            Hai nhóm thẻ thò vào rìa lá số bằng lề âm — đè 24px, vừa trong dải mây ~30px ở mép ảnh
            nên không che ô cung nào, mà bàn lá số được rộng thêm.

            `lg:contents` tháo khung này ra để hai nhóm thẻ trở thành ô của lưới ba cột bên ngoài.
            Dưới `lg` nó là khung thật, cho phép hai nhóm nằm cạnh nhau ở khổ tablet.
          */}
          <div className="mt-8 md:grid md:grid-cols-2 md:gap-5 lg:contents">
            <CardColumn
              cards={LEFT_CARDS}
              className="lg:relative lg:z-10 lg:order-1 lg:-mr-6"
              firstDelayIndex={0}
            />
            <CardColumn
              cards={RIGHT_CARDS}
              className="mt-4 md:mt-0 lg:relative lg:z-10 lg:order-3 lg:-ml-6"
              firstDelayIndex={CARDS_PER_SIDE}
            />
          </div>
        </div>

        <Reveal className="mt-10 flex justify-center md:mt-14" delay={200}>
          <a
            className="group inline-flex items-center gap-3 rounded-full border border-[#d8b26a] bg-[linear-gradient(180deg,#f2d79f_0%,#dcb268_52%,#c9994f_100%)] px-9 py-4 font-display text-base font-bold tracking-wide text-[#3d2408] no-underline shadow-[0_6px_18px_rgba(160,116,45,0.28)] transition-[transform,box-shadow,filter] duration-200 ease-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_12px_26px_rgba(160,116,45,0.36)] focus-visible:ring-2 focus-visible:ring-[#8a6420] focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:text-lg"
            href={`#${HERO_SECTION_ID}`}
          >
            {CHART_ANATOMY_SECTION.ctaLabel}
            {/* Cỡ ghi bằng px: root font-size 137.5% biến `size-4` thành 22px, to hơn hẳn chữ. */}
            <ArrowRight
              aria-hidden
              className="size-[18px] transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
