import { BASE_URL } from '../lichdungsu.constants';

export const VAN_HAN_SCRAPE_JOB = 'van-han:scrape';
export const VAN_HAN_DISPATCH_JOB = 'van-han:dispatch';
export const VAN_HAN_YEARLY_PATTERN = '0 0 1 1 *';

export const CONTENT_READY_SELECTOR = '.luu_nien_van_the .content_dtls';

export interface ZodiacSign {
  readonly order: number;
  readonly slug: string;
  readonly name: string;
}

export const ZODIAC_SIGNS: readonly ZodiacSign[] = [
  { order: 1, slug: 'ty', name: 'Tý' },
  { order: 2, slug: 'suu', name: 'Sửu' },
  { order: 3, slug: 'dan', name: 'Dần' },
  { order: 4, slug: 'mao', name: 'Mão' },
  { order: 5, slug: 'thin', name: 'Thìn' },
  { order: 6, slug: 'ty', name: 'Tỵ' },
  { order: 7, slug: 'ngo', name: 'Ngọ' },
  { order: 8, slug: 'mui', name: 'Mùi' },
  { order: 9, slug: 'than', name: 'Thân' },
  { order: 10, slug: 'dau', name: 'Dậu' },
  { order: 11, slug: 'tuat', name: 'Tuất' },
  { order: 12, slug: 'hoi', name: 'Hợi' },
];

export interface ScrapeZodiacJob {
  readonly order: number;
  readonly slug: string;
  readonly name: string;
}

export interface VanHanAspect {
  readonly aspect: string;
  readonly rating: number;
  readonly body: string;
}

export interface VanHanAgeReading {
  readonly birthYear: number;
  readonly canChi: string;
  readonly menh: string;
  readonly male: string;
  readonly female: string;
}

export interface VanHanContent {
  readonly title: string;
  readonly year: number;
  readonly bornYears: readonly number[];
  readonly luuNien: string;
  readonly luanGiai: readonly VanHanAspect[];
  readonly tungTuoi: readonly VanHanAgeReading[];
}

export function vanHanUrl(order: number, slug: string): string {
  return `${BASE_URL}/van-han/${order}-tuoi-${slug}`;
}
