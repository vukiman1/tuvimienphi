import {
  ContentKind,
  EntryGroup,
  type EntryFile,
  type EntryKind,
  type LessonFile,
} from '@org/shared-contracts';

const SAMPLE_SECTIONS = [{ heading: 'Mục', paragraphs: ['Một đoạn.'] }];
const SAMPLE_REVIEWED_AT = '2026-11-15';

export function lessonFile(slug: string, step: number, order: number, title: string): LessonFile {
  return {
    slug,
    step,
    order,
    title,
    summary: `Tóm tắt của ${title}.`,
    sections: SAMPLE_SECTIONS,
    readingMinutes: 4,
    reviewedAt: SAMPLE_REVIEWED_AT,
  };
}

export function entryFile(
  kind: EntryKind,
  group: EntryGroup,
  slug: string,
  title: string,
  learnInLesson: string,
  aliases: readonly string[] = [],
): EntryFile {
  return {
    kind,
    group,
    slug,
    title,
    aliases,
    summary: `Tóm tắt của ${title}.`,
    sections: SAMPLE_SECTIONS,
    learnInLesson,
    reviewedAt: SAMPLE_REVIEWED_AT,
  };
}

export const THIEN_CO_ENTRY = entryFile(
  ContentKind.Sao,
  EntryGroup.ChinhTinh,
  'thien-co',
  'Sao Thiên Cơ',
  'y-nghia-chinh-tinh',
);
export const HOA_LOC_ENTRY = entryFile(
  ContentKind.Sao,
  EntryGroup.TuHoa,
  'hoa-loc',
  'Sao Hóa Lộc',
  'tu-hoa-la-gi',
);
export const TA_PHU_ENTRY = entryFile(
  ContentKind.Sao,
  EntryGroup.PhuTinh,
  'ta-phu',
  'Sao Tả Phù',
  'phu-tinh-thuong-gap',
  ['Tả Hữu'],
);
export const MENH_ENTRY = entryFile(
  ContentKind.Cung,
  EntryGroup.Cung,
  'menh',
  'Cung Mệnh',
  '12-cung-tu-vi',
);
export const HANH_KIM_ENTRY = entryFile(
  ContentKind.ThuatNgu,
  EntryGroup.NguHanh,
  'hanh-kim',
  'Hành Kim',
  'am-duong-ngu-hanh-co-ban',
);
export const CAN_ENTRY = entryFile(
  ContentKind.ThuatNgu,
  EntryGroup.ThuatNgu,
  'can',
  'Thiên can',
  'la-so-tu-vi-gom-nhung-gi',
);
