const VISIBLE_CHARACTERS = 4;
const MIN_LENGTH_TO_SHOW_START = 20;
const ELLIPSIS = '…';

export const MAX_MASK_LENGTH = VISIBLE_CHARACTERS * 2 + ELLIPSIS.length;

export function maskApiKey(apiKey: string): string {
  const end = apiKey.slice(-VISIBLE_CHARACTERS);
  return apiKey.length >= MIN_LENGTH_TO_SHOW_START
    ? `${apiKey.slice(0, VISIBLE_CHARACTERS)}${ELLIPSIS}${end}`
    : `${ELLIPSIS}${end}`;
}
