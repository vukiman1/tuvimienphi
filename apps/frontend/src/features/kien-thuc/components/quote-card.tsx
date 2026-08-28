import { memo } from 'react';
import { Quote } from 'lucide-react';
import { QUOTE } from '@/features/kien-thuc/kien-thuc-data';
import { MEDIA } from '@/config/media';
import { Panel, PanelHeading } from '@/features/kien-thuc/components/panel';

/** Sidebar aphorism with a faint ink-mountain flourish in the corner. */
export const QuoteCard = memo(function QuoteCard() {
  return (
    <Panel>
      <PanelHeading>Trích dẫn hay</PanelHeading>
      <figure className="relative overflow-hidden rounded-xl">
        <img
          src={MEDIA.home.decorPhongCanh}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute right-0 bottom-0 h-20 w-auto opacity-20 [mask-image:linear-gradient(to_top,#000,transparent)]"
        />
        <Quote className="size-6 text-[#c9a15c]/60" />
        <blockquote className="relative mt-2 font-display text-[15px] leading-relaxed text-[#3f3423] italic">
          {QUOTE.text}
        </blockquote>
        <figcaption className="relative mt-3 text-[13px] font-semibold text-[#8a5a1f]">
          — {QUOTE.author}
        </figcaption>
      </figure>
    </Panel>
  );
});
