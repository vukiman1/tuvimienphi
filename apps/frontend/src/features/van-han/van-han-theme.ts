import type { CSSProperties } from 'react';
import { vanHanCoinUrl, vanHanHeroUrl } from '@/config/media';
import { ZODIAC_CHI, type ZodiacChi } from '@/lib/zodiac-icons';

/** Tô sepia icon con giáp thành đỏ maroon (giữ sắc độ) cho icon silhouette ở fallback hero. */
export const RED_ICON_STYLE: CSSProperties = {
  filter: 'sepia(1) saturate(6) hue-rotate(-28deg) brightness(0.72)',
};

/** Ảnh minh hoạ hero vẽ tay (khung tròn + phù hiệu + nền có sẵn) cho cả 12 con giáp,
 * dựng từ slug con giáp (ví dụ Ngọ → "07-ngo" → /van-han/hero-07-ngo.png). */
export const HERO_ILLUSTRATION_BY_CHI: Readonly<Record<ZodiacChi, string>> = Object.fromEntries(
  ZODIAC_CHI.map((entry) => [entry.chi, vanHanHeroUrl(entry.icon)]),
) as Record<ZodiacChi, string>;

/** Địa chi bằng chữ Hán, dùng cho phù hiệu trên khung ảnh con giáp (ví dụ 午年). */
export const HAN_BY_CHI: Readonly<Record<ZodiacChi, string>> = {
  Tý: '子',
  Sửu: '丑',
  Dần: '寅',
  Mão: '卯',
  Thìn: '辰',
  Tị: '巳',
  Ngọ: '午',
  Mùi: '未',
  Thân: '申',
  Dậu: '酉',
  Tuất: '戌',
  Hợi: '亥',
};

/** Mỗi ngũ hành một tông màu cho card năm sinh: nền card, tên can-chi, đồng xu ngũ hành,
 * pill ngũ hành, và đĩa nhỏ trước nhãn NAM. Kim = tím (theo mockup). */
export const ELEMENT_THEMES = {
  Kim: {
    coin: vanHanCoinUrl('kim'),
    card: 'border-violet-200 bg-gradient-to-br from-violet-50/70 to-purple-50/30',
    title: 'text-violet-700',
    pill: 'bg-violet-100/80 text-violet-700',
    namDisc: 'bg-violet-100 text-violet-600',
    divider: 'border-violet-200/70',
    glow: 'bg-violet-400/25',
  },
  Mộc: {
    coin: vanHanCoinUrl('moc'),
    card: 'border-green-200 bg-gradient-to-br from-green-50/70 to-emerald-50/30',
    title: 'text-green-700',
    pill: 'bg-green-100/80 text-green-700',
    namDisc: 'bg-green-100 text-green-600',
    divider: 'border-green-200/70',
    glow: 'bg-green-400/25',
  },
  Thủy: {
    coin: vanHanCoinUrl('thuy'),
    card: 'border-sky-200 bg-gradient-to-br from-sky-50/70 to-blue-50/30',
    title: 'text-sky-700',
    pill: 'bg-sky-100/80 text-sky-700',
    namDisc: 'bg-sky-100 text-sky-600',
    divider: 'border-sky-200/70',
    glow: 'bg-sky-400/25',
  },
  Hỏa: {
    coin: vanHanCoinUrl('hoa'),
    card: 'border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/30',
    title: 'text-orange-700',
    pill: 'bg-orange-100/80 text-orange-700',
    namDisc: 'bg-orange-100 text-orange-500',
    divider: 'border-orange-200/70',
    glow: 'bg-orange-400/25',
  },
  Thổ: {
    coin: vanHanCoinUrl('tho'),
    card: 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-yellow-50/40',
    title: 'text-amber-700',
    pill: 'bg-amber-100/80 text-amber-700',
    namDisc: 'bg-amber-100 text-amber-600',
    divider: 'border-amber-200/70',
    glow: 'bg-amber-400/25',
  },
} as const;

export type ElementName = keyof typeof ELEMENT_THEMES;

/** Lấy hành từ chuỗi mệnh (ví dụ "Thiên Hà Thủy" → Thủy); không khớp thì mặc định Thổ. */
export function elementOfMenh(menh: string): ElementName {
  const parts = menh.split(' ');
  const last = parts[parts.length - 1] as ElementName;
  return ELEMENT_THEMES[last] ? last : 'Thổ';
}

/** Mỗi mục luận giải một tông màu: đồng xu riêng, nhãn và dấu » cùng tông.
 * Tài Vận vàng, Sức Khoẻ lục, Sự Nghiệp lam, Tình Duyên hồng. */
export const ASPECT_THEMES = {
  'Tài Vận': {
    coin: vanHanCoinUrl('taivan'),
    label: 'text-[#a9752a]',
    bullet: 'text-[#c08a2d]',
  },
  'Sức Khoẻ': {
    coin: vanHanCoinUrl('suckhoe'),
    label: 'text-[#3f7d52]',
    bullet: 'text-[#3f7d52]',
  },
  'Sự Nghiệp': {
    coin: vanHanCoinUrl('sunghiep'),
    label: 'text-[#3f66a8]',
    bullet: 'text-[#3f66a8]',
  },
  'Tình Duyên': {
    coin: vanHanCoinUrl('tinhduyen'),
    label: 'text-[#b64c58]',
    bullet: 'text-[#b64c58]',
  },
} as const;

/** Tông màu theo nhãn mục luận giải; nhãn lạ (sai chính tả/dấu) fallback 'Tài Vận' và
 * cảnh báo ở môi trường DEV để phát hiện lệch dữ liệu backend lúc QA, không phải khi production. */
export function aspectTheme(label: string) {
  const theme = ASPECT_THEMES[label as keyof typeof ASPECT_THEMES];
  if (!theme && process.env.NODE_ENV === 'development') {
    console.warn(`[aspectTheme] nhãn luận giải không khớp theme: "${label}"`);
  }
  return theme ?? ASPECT_THEMES['Tài Vận'];
}
