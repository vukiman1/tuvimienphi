export const ZODIAC_CHI = [
  { chi: 'Tý' },
  { chi: 'Sửu' },
  { chi: 'Dần' },
  { chi: 'Mão' },
  { chi: 'Thìn' },
  { chi: 'Tị' },
  { chi: 'Ngọ' },
  { chi: 'Mùi' },
  { chi: 'Thân' },
  { chi: 'Dậu' },
  { chi: 'Tuất' },
  { chi: 'Hợi' },
] as const;

export type ZodiacChi = (typeof ZODIAC_CHI)[number]['chi'];
