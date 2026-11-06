const PERCENT_BASE = 100;
const ONE_DECIMAL = 10;

export function paidConversionPercent(casts: number, paidUnlocks: number): number | undefined {
  if (casts === 0) return undefined;
  return Math.round((paidUnlocks / casts) * PERCENT_BASE * ONE_DECIMAL) / ONE_DECIMAL;
}
