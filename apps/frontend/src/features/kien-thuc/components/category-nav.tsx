import { memo } from 'react';
import { CATEGORIES, type CategoryKey } from '@/features/kien-thuc/kien-thuc-data';
import { categoryIconUrl } from '@/config/media';
import { cn } from '@/lib/utils';

export const ALL_FILTER = 'all';
export type Filter = typeof ALL_FILTER | CategoryKey;

interface CategoryNavProps {
  readonly active: Filter;
  readonly onChange: (filter: Filter) => void;
}

const CHIP_BASE =
  'group flex w-[104px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e0bd76] motion-reduce:transition-colors motion-reduce:hover:translate-y-0';
const CHIP_ACTIVE = 'border-2 border-[#c9a15c] bg-[#fbf3e2] text-[#8a5a1f] shadow-sm';
const CHIP_IDLE =
  'border border-[#ecdcc0] bg-[#fdf9f0] text-[#7a6a55] hover:border-[#c9a15c]/70 hover:bg-[#fbf3e2] hover:text-[#8a5a1f] hover:shadow-md';
const LABEL = 'text-[10px] font-semibold whitespace-nowrap uppercase tracking-normal';
const ICON =
  'size-8 object-contain transition-transform duration-200 ease-out group-hover:scale-[1.09] motion-reduce:group-hover:scale-100';

/** The horizontal strip of topic chips — an "All" chip plus one per category, each with its glyph. */
export const CategoryNav = memo(function CategoryNav({ active, onChange }: CategoryNavProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      <button
        type="button"
        onClick={() => onChange(ALL_FILTER)}
        aria-pressed={active === ALL_FILTER}
        className={cn(CHIP_BASE, active === ALL_FILTER ? CHIP_ACTIVE : CHIP_IDLE)}
      >
        <img src={categoryIconUrl(1)} alt="" className={ICON} />
        <span className={LABEL}>Tất cả</span>
      </button>

      {CATEGORIES.map((category) => {
        const isActive = active === category.key;
        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onChange(category.key)}
            aria-pressed={isActive}
            className={cn(CHIP_BASE, isActive ? CHIP_ACTIVE : CHIP_IDLE)}
          >
            <img src={categoryIconUrl(category.iconNo)} alt="" className={ICON} />
            <span className={LABEL}>{category.label}</span>
          </button>
        );
      })}
    </div>
  );
});
