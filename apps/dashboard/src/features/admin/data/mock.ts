import type {
  AdPopup,
  AdRedirect,
  AdminUser,
  BlogPost,
  GenChartKind,
  GenRecord,
  KpiStat,
  SourceSlice,
  TrafficPoint,
  VanHanEntry,
} from './types';

/* --------------------------------------------------------------------------------------------- *
 * Deterministic pseudo-random source. A fixed seed keeps every figure stable across reloads, so
 * the console looks like real, consistent data rather than shuffling on each render.
 * --------------------------------------------------------------------------------------------- */
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0x7c3a91);
const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number): number => Math.floor(rand() * (max - min + 1)) + min;

/** A stable "today" so the mock series is reproducible and never depends on the wall clock. */
const TODAY = new Date('2026-08-27T00:00:00Z');
function dayOffset(days: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

const HO = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Ngô',
];
const TEN_DEM = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Ngọc', 'Gia', 'Thanh', 'Quốc', 'Bảo'];
const TEN = [
  'An',
  'Bình',
  'Chi',
  'Dũng',
  'Hà',
  'Hải',
  'Hương',
  'Khánh',
  'Linh',
  'Long',
  'Mai',
  'Nam',
  'Phúc',
  'Quân',
  'Trang',
  'Tú',
  'Vy',
  'Yến',
];
const HOURS = [
  'Tý (23h–1h)',
  'Sửu (1h–3h)',
  'Dần (3h–5h)',
  'Mão (5h–7h)',
  'Thìn (7h–9h)',
  'Tỵ (9h–11h)',
  'Ngọ (11h–13h)',
  'Mùi (13h–15h)',
];
const GEN_KINDS: GenChartKind[] = ['la-so', 'van-han', 'ngay-tot'];

function fullName(): string {
  return `${pick(HO)} ${pick(TEN_DEM)} ${pick(TEN)}`;
}

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com.vn', 'outlook.com', 'icloud.com', 'hotmail.com'];

/** Strip Vietnamese diacritics for an ASCII email local-part. */
function deburr(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

/** Build a varied, realistic email from a Vietnamese name (mixed formats & providers). */
function makeEmail(name: string): string {
  const parts = name.trim().split(/\s+/);
  const ho = deburr(parts[0]);
  const ten = deburr(parts[parts.length - 1]);
  const dem = parts.length > 2 ? deburr(parts[1]) : '';
  const forms = [
    `${ten}.${ho}`,
    `${ten}${ho}`,
    `${ho}${ten}`,
    `${ten}${dem}`,
    `${ten}${between(78, 99)}`,
  ];
  return `${pick(forms)}@${pick(EMAIL_DOMAINS)}`;
}

/* ------------------------------------------------ Traffic ------------------------------------- */

export const trafficSeries: TrafficPoint[] = Array.from({ length: 30 }, (_, i) => {
  const daysAgo = 29 - i;
  // A gentle upward trend with weekend dips so the line reads naturally.
  const base = 1400 + i * 42;
  const weekend = new Date(dayOffset(daysAgo)).getUTCDay();
  const dip = weekend === 0 || weekend === 6 ? 0.72 : 1;
  const views = Math.round((base + between(-180, 220)) * dip);
  const users = Math.round(views * (0.34 + rand() * 0.08));
  return { date: dayOffset(daysAgo), views, users };
});

function sumLast(days: number, key: 'views' | 'users'): number {
  return trafficSeries.slice(-days).reduce((acc, p) => acc + p[key], 0);
}
function deltaPct(days: number, key: 'views' | 'users'): number {
  const recent = trafficSeries.slice(-days).reduce((a, p) => a + p[key], 0);
  const prev = trafficSeries.slice(-days * 2, -days).reduce((a, p) => a + p[key], 0);
  if (!prev) return 0;
  return Math.round(((recent - prev) / prev) * 1000) / 10;
}

const totalGens = 3120;

export const kpiStats: KpiStat[] = [
  {
    key: 'views',
    label: 'Lượt xem (30 ngày)',
    value: sumLast(30, 'views'),
    deltaPct: deltaPct(15, 'views'),
    trend: deltaPct(15, 'views') >= 0 ? 'up' : 'down',
    spark: trafficSeries.slice(-14).map((p) => p.views),
    format: 'compact',
  },
  {
    key: 'users',
    label: 'Người dùng hoạt động',
    value: sumLast(30, 'users'),
    deltaPct: deltaPct(15, 'users'),
    trend: deltaPct(15, 'users') >= 0 ? 'up' : 'down',
    spark: trafficSeries.slice(-14).map((p) => p.users),
    format: 'compact',
  },
  {
    key: 'gens',
    label: 'Lá số đã lập',
    value: totalGens,
    deltaPct: 8.4,
    trend: 'up',
    spark: trafficSeries.slice(-14).map((p) => Math.round(p.users * 0.6)),
    format: 'number',
  },
  {
    key: 'conversion',
    label: 'Tỷ lệ lập lá số',
    value: 42,
    deltaPct: -1.6,
    trend: 'down',
    spark: [44, 43, 45, 42, 41, 43, 42, 40, 42, 43, 41, 42, 42, 42],
    format: 'percent',
  },
];

export const trafficSources: SourceSlice[] = [
  { source: 'Tìm kiếm Google', visits: 5230, element: 'kim' },
  { source: 'Truy cập trực tiếp', visits: 3120, element: 'tho' },
  { source: 'Facebook', visits: 2140, element: 'thuy' },
  { source: 'TikTok', visits: 1460, element: 'hoa' },
  { source: 'Khác', visits: 640, element: 'moc' },
];

export const genByType = [
  { type: 'Lá số tử vi', count: 1680, kind: 'la-so' as const },
  { type: 'Vận hạn năm', count: 1010, kind: 'van-han' as const },
  { type: 'Xem ngày tốt', count: 430, kind: 'ngay-tot' as const },
];

/* ------------------------------------------------ Users --------------------------------------- */

function makeGenHistory(count: number): GenRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gen_${between(10000, 99999)}_${i}`,
    kind: pick(GEN_KINDS),
    createdAt: dayOffset(between(0, 120)),
    input: {
      fullName: fullName(),
      gender: rand() > 0.5 ? 'nam' : 'nu',
      birthDate: `19${between(70, 99)}-${String(between(1, 12)).padStart(2, '0')}-${String(between(1, 28)).padStart(2, '0')}`,
      birthHour: pick(HOURS),
      calendar: rand() > 0.4 ? 'duong' : 'am',
    },
  }));
}

export const adminUsers: AdminUser[] = Array.from({ length: 46 }, (_, i) => {
  const name = fullName();
  const genCount = between(0, 24);
  const statusRoll = rand();
  return {
    id: `usr_${1000 + i}`,
    displayName: name,
    email: makeEmail(name),
    avatarSeed: name,
    role: rand() > 0.94 ? 'SELLER' : 'USER',
    status: statusRoll > 0.88 ? 'banned' : statusRoll > 0.7 ? 'inactive' : 'active',
    credits: between(0, 500),
    genCount,
    createdAt: dayOffset(between(20, 400)),
    lastActiveAt: dayOffset(between(0, 30)),
    genHistory: makeGenHistory(Math.min(genCount, 8)),
  };
});

/* ------------------------------------------------ Blog ---------------------------------------- */

const BLOG_TITLES = [
  'Luận giải cung Mệnh trong lá số tử vi',
  'Ý nghĩa sao Thái Dương và Thái Âm',
  'Cách xem ngày tốt khai trương đầu năm',
  'Vận hạn tuổi Dần năm Bính Ngọ 2026',
  'Ngũ hành tương sinh tương khắc căn bản',
  'Bố trí bàn làm việc hợp phong thủy',
  'Xem tuổi xây nhà và hóa giải Kim Lâu',
  'Giải mã sao Tử Vi tọa thủ cung Quan Lộc',
  'Chọn hướng bếp theo mệnh trạch',
  'Cách hóa giải năm hạn Tam Tai',
  'Ý nghĩa 12 cung trong lá số',
  'Phong thủy phòng ngủ cho giấc ngủ an lành',
  'Luận cách cục Sát Phá Tham',
  'Xem ngày cưới hợp tuổi đôi lứa',
  'Bản mệnh Nạp Âm và ứng dụng',
  'Cát tinh và hung tinh trong tử vi',
  'Vượng khí đầu năm cho gia chủ',
  'Ý nghĩa vòng Trường Sinh',
];
const CATEGORIES = ['Tử vi', 'Phong thủy', 'Vận hạn', 'Xem ngày', 'Kiến thức'];

export const blogPosts: BlogPost[] = BLOG_TITLES.map((title, i) => {
  const statusRoll = rand();
  const status = statusRoll > 0.82 ? 'draft' : statusRoll > 0.72 ? 'scheduled' : 'published';
  return {
    id: `post_${200 + i}`,
    title,
    slug: title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    category: pick(CATEGORIES),
    author: fullName(),
    status,
    views: between(120, 9800),
    updatedAt: dayOffset(between(0, 60)),
    publishedAt: status === 'published' ? dayOffset(between(1, 200)) : null,
  };
});

/* ------------------------------------------------ Ads ----------------------------------------- */

export const adRedirects: AdRedirect[] = [
  {
    id: 'r1',
    label: 'Ưu đãi luận giải chuyên sâu',
    slug: '/go/luan-giai',
    target: 'https://tuvi.example/pro?ref=banner',
    clicks: 3820,
    active: true,
    createdAt: dayOffset(40),
  },
  {
    id: 'r2',
    label: 'Sách phong thủy 2026',
    slug: '/go/sach-2026',
    target: 'https://shop.example/phong-thuy',
    clicks: 1560,
    active: true,
    createdAt: dayOffset(28),
  },
  {
    id: 'r3',
    label: 'Vòng tay đá phong thủy',
    slug: '/go/vong-da',
    target: 'https://shop.example/vong-tay',
    clicks: 940,
    active: true,
    createdAt: dayOffset(15),
  },
  {
    id: 'r4',
    label: 'Khóa học tử vi cơ bản',
    slug: '/go/khoa-hoc',
    target: 'https://academy.example/tuvi',
    clicks: 610,
    active: false,
    createdAt: dayOffset(70),
  },
  {
    id: 'r5',
    label: 'Tư vấn 1-1 thầy phong thủy',
    slug: '/go/tu-van',
    target: 'https://tuvi.example/booking',
    clicks: 2210,
    active: true,
    createdAt: dayOffset(9),
  },
];

export const adPopups: AdPopup[] = [
  {
    id: 'p1',
    name: 'Khuyến mãi Tết Bính Ngọ',
    trigger: 'on-load',
    image: 'popup-tet',
    target: 'https://tuvi.example/tet',
    impressions: 48200,
    clicks: 3120,
    active: true,
  },
  {
    id: 'p2',
    name: 'Nhận lá số miễn phí',
    trigger: 'exit-intent',
    image: 'popup-free',
    target: '/la-so',
    impressions: 31400,
    clicks: 4210,
    active: true,
  },
  {
    id: 'p3',
    name: 'Ưu đãi gói Pro',
    trigger: 'scroll-50',
    image: 'popup-pro',
    target: '/go/luan-giai',
    impressions: 22800,
    clicks: 1180,
    active: false,
  },
  {
    id: 'p4',
    name: 'Đăng ký nhận bản tin',
    trigger: 'timed-15s',
    image: 'popup-news',
    target: '/newsletter',
    impressions: 15600,
    clicks: 720,
    active: true,
  },
];

/* ------------------------------------------------ Vận hạn ------------------------------------- */

const STARS = [
  'Thái Dương',
  'Thái Âm',
  'Mộc Đức',
  'Vân Hớn',
  'Thổ Tú',
  'Thủy Diệu',
  'La Hầu',
  'Kế Đô',
  'Thái Bạch',
];
const RATINGS = ['cat', 'binh', 'hung'] as const;
const SUMMARIES: Record<(typeof RATINGS)[number], string> = {
  cat: 'Năm cát lợi, công danh tài lộc hanh thông, nên chủ động mở rộng.',
  binh: 'Năm bình hòa, giữ vững hiện trạng, tránh phiêu lưu mạo hiểm.',
  hung: 'Năm cần thận trọng, đề phòng thị phi sức khỏe, nên làm việc thiện.',
};

export const vanHanEntries: VanHanEntry[] = Array.from({ length: 24 }, (_, i) => {
  const rating = pick([...RATINGS]);
  const age = 18 + i * 2;
  return {
    id: `vh_${age}`,
    year: 2026,
    age,
    star: pick(STARS),
    rating,
    summary: SUMMARIES[rating],
    updatedAt: dayOffset(between(0, 45)),
    published: rand() > 0.15,
  };
});
