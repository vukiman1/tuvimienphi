import { ContentKind, EntryGroup } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';

export const GROUP_LABEL: Readonly<Record<EntryGroup, string>> = {
  [EntryGroup.ChinhTinh]: 'Chính tinh',
  [EntryGroup.TuHoa]: 'Tứ hóa',
  [EntryGroup.PhuTinh]: 'Phụ tinh',
  [EntryGroup.Cung]: 'Cung',
  [EntryGroup.NguHanh]: 'Ngũ hành',
  [EntryGroup.ThuatNgu]: 'Thuật ngữ A–Z',
};

export const KIND_INDEX_TITLE: Readonly<Record<EntryKind, string>> = {
  [ContentKind.Sao]: 'Các sao trong tử vi',
  [ContentKind.Cung]: 'Mười hai cung',
  [ContentKind.ThuatNgu]: 'Thuật ngữ tử vi',
};

export const KIND_SEARCH_LABEL: Readonly<Record<ContentKind, string>> = {
  [ContentKind.Bai]: 'Bài học',
  [ContentKind.Sao]: 'Sao',
  [ContentKind.Cung]: 'Cung',
  [ContentKind.ThuatNgu]: 'Thuật ngữ',
};
