import { EntryGroup } from '@org/shared-contracts';
import { MEDIA, kienThucEmblemUrl } from '@/config/media';
import type { PagePainting } from '@/design-system';

export const KIEN_THUC_PAINTING: PagePainting = MEDIA.kienThuc.heroNight;

export const EMBLEM_WIDTH = { small: 128, large: 256 } as const;

export interface EmblemSources {
  readonly small: string;
  readonly large: string;
}

const EMBLEM_SLUG: Readonly<Record<EntryGroup, string>> = {
  [EntryGroup.ChinhTinh]: 'chinh-tinh',
  [EntryGroup.TuHoa]: 'tu-hoa',
  [EntryGroup.PhuTinh]: 'phu-tinh',
  [EntryGroup.Cung]: 'cung',
  [EntryGroup.NguHanh]: 'ngu-hanh',
  [EntryGroup.ThuatNgu]: 'thuat-ngu',
};

export function groupEmblem(group: EntryGroup): EmblemSources {
  const slug = EMBLEM_SLUG[group];
  return {
    small: kienThucEmblemUrl(slug, EMBLEM_WIDTH.small),
    large: kienThucEmblemUrl(slug, EMBLEM_WIDTH.large),
  };
}
