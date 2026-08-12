import { ZODIAC_CHI, zodiacIconPath, type ZodiacChi } from '@/lib/zodiac-icons';

interface ZodiacPickerProps {
  readonly selectedChi: ZodiacChi;
  readonly onSelect: (chi: ZodiacChi) => void;
}

export function ZodiacPicker({ selectedChi, onSelect }: ZodiacPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
      {ZODIAC_CHI.map((entry) => {
        const isSelected = entry.chi === selectedChi;

        return (
          <button
            key={entry.chi}
            aria-pressed={isSelected}
            onClick={() => onSelect(entry.chi)}
            type="button"
            className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
              isSelected
                ? 'border-[#c9a15c] bg-gradient-to-b from-[#c9a15c]/25 to-[#c9a15c]/5 shadow-[0_0_0_1px_#c9a15c66]'
                : 'border-[#c9a15c]/25 bg-card hover:border-[#c9a15c]/60 hover:bg-primary/5'
            }`}
          >
            <img
              alt=""
              className="h-8 w-auto max-w-10 object-contain"
              src={zodiacIconPath(entry.chi) ?? undefined}
            />
            <span
              className={`font-display text-sm leading-none font-bold ${
                isSelected ? 'text-primary' : 'text-foreground'
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
