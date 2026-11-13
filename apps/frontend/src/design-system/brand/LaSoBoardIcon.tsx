import type { ReactElement } from 'react';

const BOARD_STROKE_WIDTH = 1.6;
const OUTER_CELL_DIVIDERS =
  'M7.5 3v4.5M12 3v4.5M16.5 3v4.5M7.5 16.5V21M12 16.5V21M16.5 16.5V21M3 7.5h4.5M3 12h4.5M3 16.5h4.5M16.5 7.5H21M16.5 12H21M16.5 16.5H21';
const CENTRE_PLUS = 'M12 10v4M10 12h4';

interface LaSoBoardIconProps {
  readonly className?: string;
}

export function LaSoBoardIcon({ className }: LaSoBoardIconProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={BOARD_STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="1.5" />
      <path d={OUTER_CELL_DIVIDERS} />
      <rect x="7.5" y="7.5" width="9" height="9" />
      <path d={CENTRE_PLUS} />
    </svg>
  );
}
