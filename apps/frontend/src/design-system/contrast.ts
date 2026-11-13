const HEX_RADIX = 16;
const CHANNEL_MAX = 255;
const RED_OFFSET = 1;
const GREEN_OFFSET = 3;
const BLUE_OFFSET = 5;
const CHANNEL_HEX_LENGTH = 2;
const LINEAR_SEGMENT_LIMIT = 0.03928;
const LINEAR_SEGMENT_DIVISOR = 12.92;
const GAMMA_OFFSET = 0.055;
const GAMMA_DIVISOR = 1.055;
const GAMMA_EXPONENT = 2.4;
const RED_WEIGHT = 0.2126;
const GREEN_WEIGHT = 0.7152;
const BLUE_WEIGHT = 0.0722;
const LUMINANCE_FLARE = 0.05;
const CHANNEL_OFFSETS = [RED_OFFSET, GREEN_OFFSET, BLUE_OFFSET] as const;

function channelValue(hex: string, offset: number): number {
  return Number.parseInt(hex.slice(offset, offset + CHANNEL_HEX_LENGTH), HEX_RADIX);
}

function linearChannel(hex: string, offset: number): number {
  const channel = channelValue(hex, offset) / CHANNEL_MAX;
  return channel <= LINEAR_SEGMENT_LIMIT
    ? channel / LINEAR_SEGMENT_DIVISOR
    : ((channel + GAMMA_OFFSET) / GAMMA_DIVISOR) ** GAMMA_EXPONENT;
}

function relativeLuminance(hex: string): number {
  return (
    RED_WEIGHT * linearChannel(hex, RED_OFFSET) +
    GREEN_WEIGHT * linearChannel(hex, GREEN_OFFSET) +
    BLUE_WEIGHT * linearChannel(hex, BLUE_OFFSET)
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + LUMINANCE_FLARE) / (darker + LUMINANCE_FLARE);
}

export function compositeOver(foreground: string, alpha: number, background: string): string {
  const channels = CHANNEL_OFFSETS.map((offset) => {
    const blended =
      channelValue(foreground, offset) * alpha + channelValue(background, offset) * (1 - alpha);
    return Math.round(blended).toString(HEX_RADIX).padStart(CHANNEL_HEX_LENGTH, '0');
  });
  return `#${channels.join('')}`;
}
