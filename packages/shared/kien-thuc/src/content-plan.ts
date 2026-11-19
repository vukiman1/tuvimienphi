import { ContentKind, EntryGroup, pageRef, parsePageRef } from '@org/shared-contracts';
import type { PageRef } from '@org/shared-contracts';
import { CHINH_TINH_NAMES, CUNG_NAMES, HOA_NAMES } from '@org/shared-tu-vi';
import type {
  ChinhTinhName,
  CungName,
  HoaName,
  NguHanh,
  PhuTinhName,
  SaoName,
} from '@org/shared-tu-vi';

export interface PlannedLesson {
  readonly kind: ContentKind.Bai;
  readonly slug: string;
  readonly step: number;
  readonly order: number;
  readonly title: string;
  readonly ownedConcepts: readonly string[];
}

interface PlannedEntryBase {
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly learnInLesson: string;
}

export interface PlannedStarEntry extends PlannedEntryBase {
  readonly kind: ContentKind.Sao;
  readonly group: EntryGroup.ChinhTinh | EntryGroup.TuHoa | EntryGroup.PhuTinh;
  readonly star: SaoName;
}

export interface PlannedCungEntry extends PlannedEntryBase {
  readonly kind: ContentKind.Cung;
  readonly group: EntryGroup.Cung;
  readonly cung: CungName;
}

export interface PlannedTermEntry extends PlannedEntryBase {
  readonly kind: ContentKind.ThuatNgu;
  readonly group: EntryGroup.NguHanh | EntryGroup.ThuatNgu;
  readonly hanh: NguHanh | null;
}

export type PlannedEntry = PlannedStarEntry | PlannedCungEntry | PlannedTermEntry;
export type PlannedPage = PlannedLesson | PlannedEntry;

export const KIEN_THUC_LESSONS: readonly PlannedLesson[] = [
  {
    kind: ContentKind.Bai,
    slug: 'tu-vi-la-gi',
    step: 1,
    order: 1,
    title: 'Tử vi là gì',
    ownedConcepts: [],
  },
  {
    kind: ContentKind.Bai,
    slug: 'la-so-tu-vi-gom-nhung-gi',
    step: 1,
    order: 2,
    title: 'Một lá số gồm những gì',
    ownedConcepts: [],
  },
  {
    kind: ContentKind.Bai,
    slug: 'am-duong-ngu-hanh-co-ban',
    step: 1,
    order: 3,
    title: 'Âm dương, ngũ hành cơ bản',
    ownedConcepts: ['âm dương'],
  },
  {
    kind: ContentKind.Bai,
    slug: '12-cung-tu-vi',
    step: 2,
    order: 1,
    title: '12 cung trong lá số',
    ownedConcepts: [],
  },
  {
    kind: ContentKind.Bai,
    slug: 'cung-menh-va-cung-than',
    step: 2,
    order: 2,
    title: 'Cung Mệnh và cung Thân',
    ownedConcepts: ['cung Mệnh', 'cung Thân'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'tam-hop-xung-chieu',
    step: 2,
    order: 3,
    title: 'Tam hợp, xung chiếu giữa các cung',
    ownedConcepts: ['tam hợp', 'xung chiếu', 'đối cung'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'y-nghia-chinh-tinh',
    step: 3,
    order: 1,
    title: 'Ý nghĩa chính tinh',
    ownedConcepts: ['chính tinh'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'chom-tu-vi-va-chom-thien-phu',
    step: 3,
    order: 2,
    title: 'Chòm Tử Vi và chòm Thiên Phủ',
    ownedConcepts: ['chòm Tử Vi', 'chòm Thiên Phủ'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'mieu-vuong-dac-binh-ham',
    step: 3,
    order: 3,
    title: 'Miếu, vượng, đắc, bình, hãm',
    ownedConcepts: ['miếu', 'hãm'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'phu-tinh-thuong-gap',
    step: 4,
    order: 1,
    title: 'Phụ tinh thường gặp',
    ownedConcepts: ['phụ tinh'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'tu-hoa-la-gi',
    step: 4,
    order: 2,
    title: 'Tứ hóa là gì',
    ownedConcepts: ['tứ hóa'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'tuan-va-triet',
    step: 4,
    order: 3,
    title: 'Tuần và Triệt',
    ownedConcepts: ['Tuần', 'Triệt'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'cach-xem-dai-van',
    step: 5,
    order: 1,
    title: 'Cách xem đại vận',
    ownedConcepts: ['đại vận'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'tieu-van-hang-nam',
    step: 5,
    order: 2,
    title: 'Tiểu vận hằng năm',
    ownedConcepts: ['tiểu vận'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'sao-thai-tue',
    step: 5,
    order: 3,
    title: 'Sao Thái Tuế là gì? Thái Tuế và lưu niên',
    ownedConcepts: ['Thái Tuế', 'lưu niên'],
  },
  {
    kind: ContentKind.Bai,
    slug: 'ung-dung-tu-vi-cong-viec',
    step: 6,
    order: 1,
    title: 'Tử vi trong công việc',
    ownedConcepts: [],
  },
  {
    kind: ContentKind.Bai,
    slug: 'phong-thuy-va-tu-vi',
    step: 6,
    order: 2,
    title: 'Phong thủy và tử vi',
    ownedConcepts: [],
  },
  {
    kind: ContentKind.Bai,
    slug: 'doc-la-so-cua-chinh-ban',
    step: 6,
    order: 3,
    title: 'Đọc lá số của chính bạn',
    ownedConcepts: [],
  },
];

const CHINH_TINH_SLUG: Readonly<Record<ChinhTinhName, string>> = {
  'Tử Vi': 'tu-vi',
  'Thiên Cơ': 'thien-co',
  'Thái Dương': 'thai-duong',
  'Vũ Khúc': 'vu-khuc',
  'Thiên Đồng': 'thien-dong',
  'Liêm Trinh': 'liem-trinh',
  'Thiên Phủ': 'thien-phu',
  'Thái Âm': 'thai-am',
  'Tham Lang': 'tham-lang',
  'Cự Môn': 'cu-mon',
  'Thiên Tướng': 'thien-tuong',
  'Thiên Lương': 'thien-luong',
  'Thất Sát': 'that-sat',
  'Phá Quân': 'pha-quan',
};

const HOA_SLUG: Readonly<Record<HoaName, string>> = {
  'Hóa Lộc': 'hoa-loc',
  'Hóa Quyền': 'hoa-quyen',
  'Hóa Khoa': 'hoa-khoa',
  'Hóa Kỵ': 'hoa-ky',
};

const HOA_ALIASES: Readonly<Record<HoaName, readonly string[]>> = {
  'Hóa Lộc': [],
  'Hóa Quyền': [],
  'Hóa Khoa': [],
  'Hóa Kỵ': ['Hóa Kị'],
};

interface PhuTinhPlan {
  readonly slug: string;
  readonly star: PhuTinhName;
  readonly aliases: readonly string[];
}

const PHU_TINH_PLAN: readonly PhuTinhPlan[] = [
  { slug: 'ta-phu', star: 'Tả Phù', aliases: ['Tả Hữu'] },
  { slug: 'huu-bat', star: 'Hữu Bật', aliases: ['Tả Hữu'] },
  { slug: 'van-xuong', star: 'Văn Xương', aliases: ['Xương Khúc'] },
  { slug: 'van-khuc', star: 'Văn Khúc', aliases: ['Xương Khúc'] },
  { slug: 'thien-khoi', star: 'Thiên Khôi', aliases: ['Khôi Việt'] },
  { slug: 'thien-viet', star: 'Thiên Việt', aliases: ['Khôi Việt'] },
  { slug: 'loc-ton', star: 'Lộc Tồn', aliases: [] },
  { slug: 'kinh-duong', star: 'Kình Dương', aliases: ['Dương Nhận'] },
  { slug: 'da-la', star: 'Đà La', aliases: [] },
  { slug: 'dia-khong', star: 'Địa Không', aliases: ['Không Kiếp'] },
  { slug: 'dia-kiep', star: 'Địa Kiếp', aliases: ['Không Kiếp'] },
  { slug: 'hoa-tinh', star: 'Hỏa Tinh', aliases: ['Hỏa Linh'] },
  { slug: 'linh-tinh', star: 'Linh Tinh', aliases: ['Hỏa Linh'] },
];

const CUNG_SLUG: Readonly<Record<CungName, string>> = {
  Mệnh: 'menh',
  'Phụ Mẫu': 'phu-mau',
  'Phúc Đức': 'phuc-duc',
  'Điền Trạch': 'dien-trach',
  'Quan Lộc': 'quan-loc',
  'Nô Bộc': 'no-boc',
  'Thiên Di': 'thien-di',
  'Tật Ách': 'tat-ach',
  'Tài Bạch': 'tai-bach',
  'Tử Tức': 'tu-tuc',
  'Phu Thê': 'phu-the',
  'Huynh Đệ': 'huynh-de',
};

const CUNG_ALIASES: Readonly<Record<CungName, readonly string[]>> = {
  Mệnh: [],
  'Phụ Mẫu': ['cung cha mẹ'],
  'Phúc Đức': [],
  'Điền Trạch': ['cung nhà đất'],
  'Quan Lộc': ['cung sự nghiệp', 'cung công danh'],
  'Nô Bộc': ['cung Giao Hữu', 'cung bạn bè'],
  'Thiên Di': [],
  'Tật Ách': ['cung sức khỏe'],
  'Tài Bạch': ['cung tiền bạc'],
  'Tử Tức': ['cung con cái'],
  'Phu Thê': ['cung vợ chồng'],
  'Huynh Đệ': ['cung anh em'],
};

interface NguHanhPlan {
  readonly slug: string;
  readonly title: string;
  readonly hanh: NguHanh;
}

const NGU_HANH_PLAN: readonly NguHanhPlan[] = [
  { slug: 'hanh-kim', title: 'Hành Kim', hanh: 'Kim' },
  { slug: 'hanh-moc', title: 'Hành Mộc', hanh: 'Mộc' },
  { slug: 'hanh-thuy', title: 'Hành Thủy', hanh: 'Thủy' },
  { slug: 'hanh-hoa', title: 'Hành Hỏa', hanh: 'Hỏa' },
  { slug: 'hanh-tho', title: 'Hành Thổ', hanh: 'Thổ' },
];

interface TermPlan {
  readonly slug: string;
  readonly title: string;
  readonly aliases: readonly string[];
  readonly learnInLesson: string;
}

const TERM_PLAN: readonly TermPlan[] = [
  {
    slug: 'can',
    title: 'Thiên can',
    aliases: ['can', 'can năm'],
    learnInLesson: 'la-so-tu-vi-gom-nhung-gi',
  },
  {
    slug: 'chi',
    title: 'Địa chi',
    aliases: ['chi', 'mười hai con giáp'],
    learnInLesson: 'la-so-tu-vi-gom-nhung-gi',
  },
  { slug: 'cuc', title: 'Cục', aliases: ['cục số'], learnInLesson: 'la-so-tu-vi-gom-nhung-gi' },
  { slug: 'nap-am', title: 'Nạp âm', aliases: [], learnInLesson: 'la-so-tu-vi-gom-nhung-gi' },
  { slug: 'ban-menh', title: 'Bản mệnh', aliases: [], learnInLesson: 'la-so-tu-vi-gom-nhung-gi' },
  {
    slug: 'can-luong',
    title: 'Cân lượng',
    aliases: ['cân xương'],
    learnInLesson: 'la-so-tu-vi-gom-nhung-gi',
  },
  {
    slug: 'tam-hop-luc-xung',
    title: 'Tam hợp, lục xung giữa các tuổi',
    aliases: ['tuổi hợp', 'tuổi xung'],
    learnInLesson: 'tam-hop-xung-chieu',
  },
  {
    slug: 'vo-chinh-dieu',
    title: 'Vô chính diệu',
    aliases: [],
    learnInLesson: 'tam-hop-xung-chieu',
  },
  {
    slug: 'vong-trang-sinh',
    title: 'Vòng Tràng Sinh',
    aliases: [],
    learnInLesson: 'phu-tinh-thuong-gap',
  },
  {
    slug: 'lai-nhan-cung',
    title: 'Lai nhân cung',
    aliases: [],
    learnInLesson: 'cung-menh-va-cung-than',
  },
];

const CHINH_TINH_ENTRIES: readonly PlannedStarEntry[] = CHINH_TINH_NAMES.map(
  (star): PlannedStarEntry => ({
    kind: ContentKind.Sao,
    group: EntryGroup.ChinhTinh,
    slug: CHINH_TINH_SLUG[star],
    title: `Sao ${star}`,
    aliases: [],
    learnInLesson: 'y-nghia-chinh-tinh',
    star,
  }),
);

const TU_HOA_ENTRIES: readonly PlannedStarEntry[] = HOA_NAMES.map((star): PlannedStarEntry => ({
  kind: ContentKind.Sao,
  group: EntryGroup.TuHoa,
  slug: HOA_SLUG[star],
  title: star,
  aliases: HOA_ALIASES[star],
  learnInLesson: 'tu-hoa-la-gi',
  star,
}));

const PHU_TINH_ENTRIES: readonly PlannedStarEntry[] = PHU_TINH_PLAN.map(
  ({ slug, star, aliases }): PlannedStarEntry => ({
    kind: ContentKind.Sao,
    group: EntryGroup.PhuTinh,
    slug,
    title: `Sao ${star}`,
    aliases,
    learnInLesson: 'phu-tinh-thuong-gap',
    star,
  }),
);

const CUNG_ENTRIES: readonly PlannedCungEntry[] = CUNG_NAMES.map((cung): PlannedCungEntry => ({
  kind: ContentKind.Cung,
  group: EntryGroup.Cung,
  slug: CUNG_SLUG[cung],
  title: `Cung ${cung}`,
  aliases: CUNG_ALIASES[cung],
  learnInLesson: '12-cung-tu-vi',
  cung,
}));

const NGU_HANH_ENTRIES: readonly PlannedTermEntry[] = NGU_HANH_PLAN.map(
  ({ slug, title, hanh }): PlannedTermEntry => ({
    kind: ContentKind.ThuatNgu,
    group: EntryGroup.NguHanh,
    slug,
    title,
    aliases: [],
    learnInLesson: 'am-duong-ngu-hanh-co-ban',
    hanh,
  }),
);

const TERM_ENTRIES: readonly PlannedTermEntry[] = TERM_PLAN.map(
  ({ slug, title, aliases, learnInLesson }): PlannedTermEntry => ({
    kind: ContentKind.ThuatNgu,
    group: EntryGroup.ThuatNgu,
    slug,
    title,
    aliases,
    learnInLesson,
    hanh: null,
  }),
);

export const KIEN_THUC_ENTRIES: readonly PlannedEntry[] = [
  ...CHINH_TINH_ENTRIES,
  ...TU_HOA_ENTRIES,
  ...PHU_TINH_ENTRIES,
  ...CUNG_ENTRIES,
  ...NGU_HANH_ENTRIES,
  ...TERM_ENTRIES,
];

export function plannedRefOf(page: PlannedPage): PageRef {
  return pageRef(page.kind, page.slug);
}

const PAGES_BY_REF: ReadonlyMap<PageRef, PlannedPage> = new Map(
  [...KIEN_THUC_LESSONS, ...KIEN_THUC_ENTRIES].map((page) => [plannedRefOf(page), page]),
);

export function plannedPage(ref: PageRef): PlannedPage | undefined {
  const parsed = parsePageRef(ref);
  if (!parsed) {
    return undefined;
  }
  return PAGES_BY_REF.get(pageRef(parsed.kind, parsed.slug));
}

export function lessonsOfStep(step: number): readonly PlannedLesson[] {
  return KIEN_THUC_LESSONS.filter((lesson) => lesson.step === step).sort(
    (a, b) => a.order - b.order,
  );
}
