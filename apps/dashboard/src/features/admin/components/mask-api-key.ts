const VISIBLE_CHARACTERS = 4;
const MIN_LENGTH_TO_SHOW_START = 20;
const ELLIPSIS = '…';
const HIDDEN = '••••••••';

export function maskApiKey(apiKey: string): string {
  const end = apiKey.slice(-VISIBLE_CHARACTERS);
  return apiKey.length >= MIN_LENGTH_TO_SHOW_START
    ? `${apiKey.slice(0, VISIBLE_CHARACTERS)}${ELLIPSIS}${end}`
    : `${ELLIPSIS}${end}`;
}

export function keyPreview(hint: string | null): string {
  if (!hint) {
    return HIDDEN;
  }
  return hint.includes(ELLIPSIS) ? hint.replace(ELLIPSIS, HIDDEN) : `${HIDDEN}${hint}`;
}
