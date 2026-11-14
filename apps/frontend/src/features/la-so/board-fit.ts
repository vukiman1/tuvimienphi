export enum BoardVariant {
  Compact = 'compact',
  Full = 'full',
}

export const FULL_BOARD_MIN_WIDTH = 680;
export const FULL_BOARD_WIDTH = 812;
const MAX_BOARD_SCALE = 1;

export function boardVariantFor(containerWidth: number): BoardVariant {
  return containerWidth < FULL_BOARD_MIN_WIDTH ? BoardVariant.Compact : BoardVariant.Full;
}

export function boardScaleFor(containerWidth: number): number {
  return Math.min(MAX_BOARD_SCALE, containerWidth / FULL_BOARD_WIDTH);
}
