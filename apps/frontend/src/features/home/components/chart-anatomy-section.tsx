import { HERO_SECTION_ID } from '@/features/home/components/hero-section';
import { SectionHeading } from '@/features/home/components/section-heading';
import { MEDIA } from '@/config/media';
import { CHART_ANATOMY_SECTION } from '@/features/home/home-content';

const HEADING_ID = 'home-chart-anatomy-title';

const PLATE_STYLE = {
  backgroundImage: `url(${MEDIA.home.ctaPlate})`,
  backgroundSize: '100% 100%',
  backgroundRepeat: 'no-repeat',
} as const;

/** The leader line only exists from lg up, where the notes actually flank the chart. */
function LeaderLine({ side }: { readonly side: 'left' | 'right' }) {
  return (
    <span aria-hidden className="hidden w-12 shrink-0 items-center gap-1 lg:flex">
      {side === 'right' && <span className="size-1.5 shrink-0 rounded-full bg-[#c9a15c]" />}
      <span className="h-px flex-1 bg-[#c9a15c]/70" />
      {side === 'left' && <span className="size-1.5 shrink-0 rounded-full bg-[#c9a15c]" />}
    </span>
  );
}

function ChartNotes({
  notes,
  side,
}: {
  readonly notes: readonly string[];
  readonly side: 'left' | 'right';
}) {
  return (
    <ul className="grid grid-cols-2 gap-x-6 gap-y-4 lg:flex lg:flex-col lg:gap-20">
      {notes.map((note) => (
        <li
          className={`flex items-center gap-3 ${side === 'left' ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
          key={note}
        >
          <span
            className={`flex-1 text-sm leading-snug font-medium text-[#6b5a44] lg:text-base ${
              side === 'left' ? 'lg:text-right' : 'lg:text-left'
            }`}
          >
            {note}
          </span>
          <LeaderLine side={side} />
        </li>
      ))}
    </ul>
  );
}

export function ChartAnatomySection() {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden bg-[#fdf9f0] pt-[56px] pb-[120px] md:pt-[72px] md:pb-[170px]"
    >
      <div className="relative mx-auto w-full max-w-[1120px] px-4 md:px-6">
        <SectionHeading id={HEADING_ID} title={CHART_ANATOMY_SECTION.title} />

        <div className="mt-[44px] flex flex-col gap-8 md:mt-[60px] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)_minmax(0,1fr)] lg:items-center lg:gap-6">
          <ChartNotes notes={CHART_ANATOMY_SECTION.leftNotes} side="left" />

          <img
            alt="Lá số tử vi mẫu với mười hai cung"
            className="order-first mx-auto w-full max-w-[560px] rounded-lg shadow-lg lg:order-none"
            loading="lazy"
            src={MEDIA.home.laSoDemo}
          />

          <ChartNotes notes={CHART_ANATOMY_SECTION.rightNotes} side="right" />
        </div>

        <div className="mt-[52px] flex justify-center md:mt-[68px]">
          <a
            className="flex aspect-[808/161] w-full max-w-[320px] items-center justify-center px-5 text-center font-display text-sm font-bold whitespace-nowrap tracking-wide text-[#fdf3dc] uppercase no-underline [text-shadow:0_1px_3px_rgba(60,26,4,0.85)] transition hover:brightness-110 sm:text-base"
            href={`#${HERO_SECTION_ID}`}
            style={PLATE_STYLE}
          >
            {CHART_ANATOMY_SECTION.ctaLabel}
          </a>
        </div>
      </div>

      <img
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 w-[280px] opacity-[0.13] select-none sm:w-[380px] md:w-[480px]"
        loading="lazy"
        src={MEDIA.home.decorPhongCanh}
      />
    </section>
  );
}
