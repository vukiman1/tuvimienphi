import type { CSSProperties } from 'react';
import {
  Briefcase,
  Coins,
  Flame,
  Gem,
  HeartPulse,
  Leaf,
  Mountain,
  Users,
  Waves,
} from 'lucide-react';
import { MEDIA } from '@/config/media';
import type { ZodiacChi } from '@/lib/zodiac-icons';

/** Tô sepia icon con giáp thành đỏ maroon (giữ sắc độ) cho icon silhouette ở fallback hero. */
export const RED_ICON_STYLE: CSSProperties = {
  filter: 'sepia(1) saturate(6) hue-rotate(-28deg) brightness(0.72)',
};

/** Ảnh minh hoạ hero vẽ tay (đã có sẵn khung tròn + phù hiệu + nền) cho từng con giáp.
 * Con giáp chưa có ảnh riêng sẽ fallback về khung tròn CSS + icon silhouette. */
export const HERO_ILLUSTRATION_BY_CHI: Partial<Record<ZodiacChi, string>> = {
  Ngọ: MEDIA.vanHan.heroNgo,
};

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

/** Mỗi ngũ hành một tông màu cho card năm sinh: nền card, tên can-chi, huy chương tròn,
 * icon, pill ngũ hành, và đĩa nhỏ trước nhãn NAM. Kim = tím (theo mockup). */
export const ELEMENT_THEMES = {
  Kim: {
    icon: Gem,
    card: 'border-violet-200 bg-gradient-to-br from-violet-50/70 to-purple-50/30',
    title: 'text-violet-700',
    ring: 'border-violet-400/60',
    iconColor: 'text-violet-600',
    pill: 'bg-violet-100/80 text-violet-700',
    namDisc: 'bg-violet-100 text-violet-600',
    divider: 'border-violet-200/70',
  },
  Mộc: {
    icon: Leaf,
    card: 'border-green-200 bg-gradient-to-br from-green-50/70 to-emerald-50/30',
    title: 'text-green-700',
    ring: 'border-green-400/60',
    iconColor: 'text-green-600',
    pill: 'bg-green-100/80 text-green-700',
    namDisc: 'bg-green-100 text-green-600',
    divider: 'border-green-200/70',
  },
  Thủy: {
    icon: Waves,
    card: 'border-sky-200 bg-gradient-to-br from-sky-50/70 to-blue-50/30',
    title: 'text-sky-700',
    ring: 'border-sky-400/60',
    iconColor: 'text-sky-600',
    pill: 'bg-sky-100/80 text-sky-700',
    namDisc: 'bg-sky-100 text-sky-600',
    divider: 'border-sky-200/70',
  },
  Hỏa: {
    icon: Flame,
    card: 'border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/30',
    title: 'text-orange-700',
    ring: 'border-orange-400/60',
    iconColor: 'text-orange-500',
    pill: 'bg-orange-100/80 text-orange-700',
    namDisc: 'bg-orange-100 text-orange-500',
    divider: 'border-orange-200/70',
  },
  Thổ: {
    icon: Mountain,
    card: 'border-amber-200 bg-gradient-to-br from-amber-50/80 to-yellow-50/40',
    title: 'text-amber-700',
    ring: 'border-amber-400/60',
    iconColor: 'text-amber-600',
    pill: 'bg-amber-100/80 text-amber-700',
    namDisc: 'bg-amber-100 text-amber-600',
    divider: 'border-amber-200/70',
  },
} as const;

export type ElementName = keyof typeof ELEMENT_THEMES;

/** Lấy hành từ chuỗi mệnh (ví dụ "Thiên Hà Thủy" → Thủy); không khớp thì mặc định Thổ. */
export function elementOfMenh(menh: string): ElementName {
  const parts = menh.split(' ');
  const last = parts[parts.length - 1] as ElementName;
  return ELEMENT_THEMES[last] ? last : 'Thổ';
}

/** Mỗi mục luận giải một tông màu: đĩa icon tô đặc + chữ trắng, nhãn và dấu » cùng tông.
 * Tài Vận vàng, Sức Khoẻ lục, Sự Nghiệp lam, Tình Duyên hồng. */
export const ASPECT_THEMES = {
  'Tài Vận': {
    Icon: Coins,
    disc: 'bg-gradient-to-br from-[#d9a441] to-[#b9862c]',
    label: 'text-[#a9752a]',
    bullet: 'text-[#c08a2d]',
  },
  'Sức Khoẻ': {
    Icon: HeartPulse,
    disc: 'bg-gradient-to-br from-[#6aa877] to-[#3f7d52]',
    label: 'text-[#3f7d52]',
    bullet: 'text-[#3f7d52]',
  },
  'Sự Nghiệp': {
    Icon: Briefcase,
    disc: 'bg-gradient-to-br from-[#6088c6] to-[#3f66a8]',
    label: 'text-[#3f66a8]',
    bullet: 'text-[#3f66a8]',
  },
  'Tình Duyên': {
    Icon: Users,
    disc: 'bg-gradient-to-br from-[#d3767e] to-[#b64c58]',
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
