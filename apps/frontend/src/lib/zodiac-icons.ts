export const ZODIAC_CHI = [
  { chi: 'Tý', icon: '01-ty' },
  { chi: 'Sửu', icon: '02-suu' },
  { chi: 'Dần', icon: '03-dan' },
  { chi: 'Mão', icon: '04-mao' },
  { chi: 'Thìn', icon: '05-thin' },
  { chi: 'Tỵ', icon: '06-ti' },
  { chi: 'Ngọ', icon: '07-ngo' },
  { chi: 'Mùi', icon: '08-mui' },
  { chi: 'Thân', icon: '09-than' },
  { chi: 'Dậu', icon: '10-dau' },
  { chi: 'Tuất', icon: '11-tuat' },
  { chi: 'Hợi', icon: '12-hoi' },
] as const;

export type ZodiacChi = (typeof ZODIAC_CHI)[number]['chi'];

const CHI_ALIASES: Readonly<Record<string, ZodiacChi>> = { Tị: 'Tỵ' };

export function normalizeChi(chi: string): ZodiacChi | null {
  const normalized = CHI_ALIASES[chi] ?? chi;
  return ZODIAC_CHI.some((entry) => entry.chi === normalized) ? (normalized as ZodiacChi) : null;
}

export function zodiacIconPath(
  chi: string,
  variant: 'default' | 'gold' = 'default',
): string | null {
  const normalized = normalizeChi(chi);
  const entry = ZODIAC_CHI.find((item) => item.chi === normalized);
  if (!entry) {
    return null;
  }
  return `/zodiac/${entry.icon}${variant === 'gold' ? '-gold' : ''}.png`;
}
