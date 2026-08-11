export const NAV_ITEMS = [
  { label: 'Lá Số', href: '/la-so' },
  { label: 'Lịch Âm', href: '/lich-am' },
  { label: 'Ngày Tốt', href: '/ngay-tot' },
  { label: 'Gieo Quẻ', href: '/gieo-que' },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
