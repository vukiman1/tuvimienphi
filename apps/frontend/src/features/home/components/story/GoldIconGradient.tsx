import type { ReactElement } from 'react';

const GOLD_ICON_GRADIENT_ID = 'home-gold-icon';

export const GOLD_ICON_COLOR = `url(#${GOLD_ICON_GRADIENT_ID})`;

export function GoldIconGradient(): ReactElement {
  return (
    <svg aria-hidden="true" focusable="false" className="absolute size-0">
      <defs>
        <linearGradient
          id={GOLD_ICON_GRADIENT_ID}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="2"
          x2="0"
          y2="22"
        >
          <stop offset="0%" stopColor="var(--color-dawn)" />
          <stop offset="55%" stopColor="var(--color-gold)" />
          <stop offset="100%" stopColor="var(--color-ember)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
