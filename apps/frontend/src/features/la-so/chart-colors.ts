import { type NguHanh } from '@org/shared-tu-vi';

export const CUNG_SURFACE_CLASS = {
  base: 'bg-night',
  spotlight: 'bg-gold/12',
} as const;

export const CUNG_STATE_CLASS = {
  picked: 'inset-ring-2 inset-ring-gold shadow-glow-gold-strong',
  focused: 'inset-ring-2 inset-ring-dawn',
  related: 'inset-ring-1 inset-ring-gold/60',
} as const;

export function cungStateClass(
  isPicked: boolean,
  isFocused: boolean,
  isRelated: boolean,
): string | undefined {
  if (isPicked) return CUNG_STATE_CLASS.picked;
  if (isFocused) return CUNG_STATE_CLASS.focused;
  if (isRelated) return CUNG_STATE_CLASS.related;
  return undefined;
}

export const CHART_RULE_CLASS = {
  border: 'border-gold/55',
  fill: 'bg-gold/55',
  blockLabel: 'bg-day text-night',
} as const;

export const CHART_LINE_CLASS = {
  tamHop: 'stroke-gold drop-shadow-glow-gold',
  xungChieu: 'stroke-ember',
} as const;

export const SAO_ON_DAY_CLASS: Readonly<Record<NguHanh, string>> = {
  Kim: 'text-hanh-kim',
  Mộc: 'text-hanh-moc',
  Thủy: 'text-hanh-thuy',
  Hỏa: 'text-hanh-hoa',
  Thổ: 'text-hanh-tho',
};

export const SAO_ON_NIGHT_CLASS: Readonly<Record<NguHanh, string>> = {
  Kim: 'text-hanh-kim-night',
  Mộc: 'text-hanh-moc-night',
  Thủy: 'text-hanh-thuy-night',
  Hỏa: 'text-hanh-hoa-night',
  Thổ: 'text-hanh-tho-night',
};
