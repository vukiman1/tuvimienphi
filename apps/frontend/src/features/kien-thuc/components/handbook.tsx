import { memo } from 'react';
import { ArrowRight, BookOpen, CalendarRange, Sparkles, type LucideIcon } from 'lucide-react';
import { GUIDES, type GuideIcon } from '@/features/kien-thuc/kien-thuc-data';
import { Panel, PanelHeading } from '@/features/kien-thuc/components/panel';

const GUIDE_ICONS: Record<GuideIcon, LucideIcon> = {
  almanac: BookOpen,
  stars: Sparkles,
  year: CalendarRange,
};

/** Sidebar shortcuts into the tử vi handbook, plus a link to the full set. */
export const Handbook = memo(function Handbook() {
  return (
    <Panel>
      <PanelHeading>Cẩm nang tử vi</PanelHeading>
      <ul className="flex flex-col gap-2.5">
        {GUIDES.map((guide) => {
          const Icon = GUIDE_ICONS[guide.icon];
          return (
            <li key={guide.title}>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#efe6d4] bg-[#faf5ea] p-3 text-left transition-colors hover:border-[#c9a15c]/60 hover:bg-[#f5ecda]"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f0e2c8] text-[#8a5a1f]">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[#2a1f0e]">
                    {guide.title}
                  </span>
                  <span className="block text-[13px] text-[#8d7a5c]">{guide.description}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#9e2b1e] hover:underline"
        >
          Xem tất cả cẩm nang
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </Panel>
  );
});
