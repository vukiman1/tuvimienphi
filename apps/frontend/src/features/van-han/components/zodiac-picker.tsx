import { ZODIAC_CHI, zodiacIconPath, type ZodiacChi } from '@/lib/zodiac-icons';
import { RED_ICON_STYLE } from '@/features/van-han/van-han-theme';

interface ZodiacPickerProps {
  readonly selectedChi: ZodiacChi;
  readonly onSelect: (chi: ZodiacChi) => void;
}

/** 4 sparkle mảnh (4-point star) nhô ra ở 4 góc chéo quanh vòng tròn đang chọn. */
const SPARKLE_POSITIONS = [
  '-top-1.5 -left-1.5',
  '-top-1.5 -right-1.5',
  '-bottom-1.5 -left-1.5',
  '-bottom-1.5 -right-1.5',
];

function Sparkle({ className }: { readonly className: string }) {
  return (
    <svg
      aria-hidden
      className={`absolute size-2.5 text-[#d9a441] ${className}`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 0c1.1 8 2.9 10.9 12 12-9.1 1.1-10.9 4-12 12-1.1-8-2.9-10.9-12-12 9.1-1.1 10.9-4 12-12Z" />
    </svg>
  );
}

export function ZodiacPicker({ selectedChi, onSelect }: ZodiacPickerProps) {
  return (
    <div className="grid grid-cols-6 justify-items-center gap-x-2 gap-y-3 md:grid-cols-12">
      {ZODIAC_CHI.map((entry) => {
        const isSelected = entry.chi === selectedChi;

        return (
          <button
            key={entry.chi}
            aria-pressed={isSelected}
            onClick={() => onSelect(entry.chi)}
            type="button"
            className="group flex flex-col items-center gap-1.5 outline-none"
          >
            <span
              className={`relative flex size-12 items-center justify-center rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-ring/60 sm:size-14 ${
                isSelected
                  ? 'bg-gradient-to-b from-[#fbeecb] to-[#f3dca0] shadow-[0_0_0_1px_#e0a83a,inset_0_0_0_3px_#fff8,inset_0_0_0_4px_#e0a83a55]'
                  : 'bg-[#fdf9f0] shadow-[0_0_0_1px_#c9a15c66] group-hover:shadow-[0_0_0_1px_#c9a15caa]'
              }`}
            >
              {isSelected && SPARKLE_POSITIONS.map((pos) => <Sparkle key={pos} className={pos} />)}
              <img
                alt=""
                className="relative h-8 w-auto max-w-10 object-contain sm:h-9"
                src={zodiacIconPath(entry.chi) ?? undefined}
                style={isSelected ? RED_ICON_STYLE : undefined}
              />
            </span>
            <span
              className={`font-display text-sm leading-none font-bold ${
                isSelected ? 'text-[#a8332a]' : 'text-foreground'
              }`}
            >
              {entry.chi}
            </span>
          </button>
        );
      })}
    </div>
  );
}
