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

export const KIND_INDEX_LEAD: Readonly<Record<EntryKind, string>> = {
  [ContentKind.Sao]: 'Mỗi sao một trang: hành, nhóm sao và bậc ở từng địa chi.',
  [ContentKind.Cung]: 'Mười hai cung theo thứ tự trên lá số, mỗi cung một trang.',
  [ContentKind.ThuatNgu]: 'Ngũ hành và những từ hay gặp khi đọc lá số.',
};

export const KIND_INDEX_DESCRIPTION: Readonly<Record<EntryKind, string>> = {
  [ContentKind.Sao]:
    'Tra cứu từng sao trong lá số tử vi: hành, nhóm sao và bậc ở từng địa chi theo bảng an sao.',
  [ContentKind.Cung]:
    'Mười hai cung trong lá số tử vi: cung đối, tam hợp và ý nghĩa của từng cung.',
  [ContentKind.ThuatNgu]:
    'Ngũ hành và các thuật ngữ tử vi thường gặp, mỗi từ một trang giải thích ngắn.',
};
