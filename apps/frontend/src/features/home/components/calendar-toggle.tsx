import { CALENDAR_LABELS, CalendarType } from '@/features/la-so/birth-input';
import { MEDIA } from '@/config/media';

/** Track width minus knob width minus the padding on both sides — how far the knob travels. */
const KNOB_TRAVEL = 'translate-x-[30px]';

interface CalendarToggleProps {
  readonly value: CalendarType;
  readonly onChange: (value: CalendarType) => void;
}

/** Solar on the left, lunar on the right — the two calendars a birth date can be given in. */
export function CalendarToggle({ value, onChange }: CalendarToggleProps) {
  const isLunar = value === CalendarType.Lunar;

  return (
    <div className="flex shrink-0 items-center gap-2 text-sm font-medium">
      <span className={isLunar ? 'text-[#f3e6cd]/45' : 'text-[#f6e3b6]'}>
        {CALENDAR_LABELS[CalendarType.Solar]}
      </span>

      <button
        aria-checked={isLunar}
        aria-label="Dùng lịch âm"
        className={`relative h-[34px] w-[64px] shrink-0 rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none ${
          isLunar ? 'border-[#c9a15c] bg-[#1c1309]' : 'border-[#d9b063] bg-[#ecd9a8]'
        }`}
        onClick={() => onChange(isLunar ? CalendarType.Solar : CalendarType.Lunar)}
        role="switch"
        type="button"
      >
        {/* A full turn rather than a partial one: the disc reads as rolling to the other side. */}
        <img
          alt=""
          aria-hidden
          className={`absolute top-[2px] left-[2px] size-[28px] transition-transform duration-300 ease-out motion-reduce:transition-none ${
            isLunar ? `${KNOB_TRAVEL} rotate-[360deg]` : 'translate-x-0 rotate-[0deg]'
          }`}
          src={MEDIA.home.heroAmDuong}
        />
      </button>

      <span className={isLunar ? 'text-[#f6e3b6]' : 'text-[#f3e6cd]/45'}>
        {CALENDAR_LABELS[CalendarType.Lunar]}
      </span>
    </div>
  );
}
