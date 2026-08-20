import { NotchedFrame } from '@/features/home/components/notched-frame';
import { SectionHeading } from '@/features/home/components/section-heading';
import { homeIconUrl } from '@/config/media';
import { PERSPECTIVES_SECTION } from '@/features/home/home-content';

const HEADING_ID = 'home-perspectives-title';

export function PerspectivesSection() {
  return (
    <section aria-labelledby={HEADING_ID} className="bg-[#fdf9f0]">
      <div className="mx-auto w-full max-w-[1120px] px-4 pt-[56px] pb-[56px] md:px-6 md:pt-[80px] md:pb-[72px]">
        <SectionHeading id={HEADING_ID} title={PERSPECTIVES_SECTION.title} />

        <ul className="mt-[44px] grid grid-cols-2 gap-5 md:mt-[60px] md:grid-cols-4 md:gap-8">
          {PERSPECTIVES_SECTION.cards.map((card) => (
            <li className="h-full" key={card.key}>
              <NotchedFrame className="flex h-full flex-col items-center px-1.5 py-4 text-center md:px-2 md:py-5">
                <img
                  alt=""
                  aria-hidden
                  className="size-16 object-contain md:size-20"
                  loading="lazy"
                  src={homeIconUrl(card.key)}
                />
                <p className="mt-3 font-display text-lg font-bold text-[#2a1f0e] md:mt-4 md:text-2xl">
                  {card.name}
                </p>
                <p className="mt-1 text-xs text-[#6b5a44] md:text-sm">{card.description}</p>
              </NotchedFrame>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
