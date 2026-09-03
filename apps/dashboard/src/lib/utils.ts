export { cn } from '@org/frontend-shared';

/** Two-letter initials from a Vietnamese name (first + last word). */
export function initials(name: string | null | undefined): string {
  if (!name) return 'QT';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

/** Vietnamese-locale integer formatting, e.g. 12345 → "12.345". */
const numberFormatter = new Intl.NumberFormat('vi-VN');
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Compact figures for KPI tiles, e.g. 12345 → "12,3N", 2_100_000 → "2,1Tr". */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}Tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}N`;
  return String(value);
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
export function formatDate(value: string | Date): string {
  return dateFormatter.format(typeof value === 'string' ? new Date(value) : value);
}
