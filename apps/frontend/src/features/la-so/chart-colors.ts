import { type NguHanh } from '@org/shared-tu-vi';

export const CUNG_SURFACE_CLASS = {
  base: 'bg-day',
  spotlight: 'bg-gold/10',
} as const;

export const CUNG_STATE_CLASS = {
  focused: 'inset-ring-2 inset-ring-gold',
  picked: 'inset-ring-2 inset-ring-ink',
  related: 'inset-ring-1 inset-ring-gold',
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
  border: 'border-ink/20',
  fill: 'bg-ink/20',
  blockLabel: 'bg-chart-block text-day',
} as const;

export const CHART_LINE_CLASS = {
  tamHop: 'stroke-deep',
  xungChieu: 'stroke-ember',
} as const;

export const SAO_ELEMENT_CLASS: Readonly<Record<NguHanh, string>> = {
  Kim: 'text-hanh-kim',
  Mộc: 'text-hanh-moc',
  Thủy: 'text-hanh-thuy',
  Hỏa: 'text-hanh-hoa',
  Thổ: 'text-hanh-tho',
};
