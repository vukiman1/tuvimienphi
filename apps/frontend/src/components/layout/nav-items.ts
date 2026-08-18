export const NAV_ITEMS = [
  { label: 'Lá Số', href: '/la-so' },
  { label: 'Vận Hạn', href: '/van-han' },
  { label: 'Ngày Tốt', href: '/ngay-tot' },
  { label: 'Kiến Thức', href: '/kien-thuc' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
