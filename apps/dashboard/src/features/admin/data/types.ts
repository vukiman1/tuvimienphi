/** Domain models for the console. These mirror the shapes a future admin API is expected to return,
 *  so swapping the mock services for real HTTP calls is a drop-in change. */

export type TrendDirection = 'up' | 'down' | 'flat';

export interface KpiStat {
  key: string;
  label: string;
  value: number;
  /** Percentage change vs the previous period. */
  deltaPct: number;
  trend: TrendDirection;
  /** Sparkline series (recent values). */
  spark: number[];
  format: 'number' | 'compact' | 'percent';
}

export interface TrafficPoint {
  date: string; // ISO day
  views: number;
  users: number;
}

export interface SourceSlice {
  source: string;
  visits: number;
  /** One of the ngũ-hành palette tokens for consistent theming. */
  element: 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho';
}

export interface GenTypeSlice {
  type: string;
  count: number;
}

export type GenChartKind = 'la-so' | 'van-han' | 'ngay-tot';

export interface GenRecord {
  id: string;
  kind: GenChartKind;
  createdAt: string;
  /** The birth info the user entered for this reading. */
  input: BirthInput;
}

export interface BirthInput {
  fullName: string;
  gender: 'nam' | 'nu';
  birthDate: string; // ISO
  birthHour: string; // canchi hour, e.g. "Tý (23h–1h)"
  calendar: 'duong' | 'am';
}

export type UserStatus = 'active' | 'inactive' | 'banned';

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  avatarSeed: string;
  role: 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  status: UserStatus;
  credits: number;
  genCount: number;
  createdAt: string;
  lastActiveAt: string;
  genHistory: GenRecord[];
}

export type PostStatus = 'published' | 'draft' | 'scheduled';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: PostStatus;
  views: number;
  updatedAt: string;
  publishedAt: string | null;
}

export interface AdRedirect {
  id: string;
  label: string;
  slug: string; // short path, e.g. /go/tetsale
  target: string; // destination URL
  clicks: number;
  active: boolean;
  createdAt: string;
}

export type PopupTrigger = 'on-load' | 'exit-intent' | 'scroll-50' | 'timed-15s';

export interface AdPopup {
  id: string;
  name: string;
  trigger: PopupTrigger;
  image: string;
  target: string;
  impressions: number;
  clicks: number;
  active: boolean;
}

export type VanHanRating = 'cat' | 'binh' | 'hung';

export interface VanHanEntry {
  id: string;
  year: number;
  age: number;
  star: string; // sao chiếu mệnh
  rating: VanHanRating;
  summary: string;
  updatedAt: string;
  published: boolean;
}
