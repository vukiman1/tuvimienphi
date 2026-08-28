import { cn } from '@/lib/utils';

type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Tổng quan — a compass star / thiên bàn. */
export function IconThienBan({ className }: IconProps) {
  return (
    <svg {...base} className={cn('size-full', className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" opacity="0.35" />
      <path d="M12 4 L13.4 10.6 L20 12 L13.4 13.4 L12 20 L10.6 13.4 L4 12 L10.6 10.6 Z" />
    </svg>
  );
}

/** Người dùng — mệnh chủ: a figure beneath a guiding star. */
export function IconMenhChu({ className }: IconProps) {
  return (
    <svg {...base} className={cn('size-full', className)} aria-hidden="true">
      <circle cx="12" cy="10" r="3" />
      <path d="M6 20a6 6 0 0 1 12 0" />
      <path
        d="M18.5 4.5 l0.5 1.4 1.4 0.5 -1.4 0.5 -0.5 1.4 -0.5 -1.4 -1.4 -0.5 1.4 -0.5 Z"
        opacity="0.9"
      />
    </svg>
  );
}

/** Bài viết — a scroll (cuộn thư). */
export function IconScroll({ className }: IconProps) {
  return (
    <svg {...base} className={cn('size-full', className)} aria-hidden="true">
      <rect x="5" y="4" width="14" height="2.4" rx="1.2" />
      <rect x="5" y="17.6" width="14" height="2.4" rx="1.2" />
      <path d="M7 6.6 h10 v10.8 H7 Z" opacity="0.55" />
      <path d="M9.4 10.2 h5.2 M9.4 13 h5.2" />
    </svg>
  );
}

/** Quảng cáo — a hanging lantern (đèn lồng). */
export function IconLantern({ className }: IconProps) {
  return (
    <svg {...base} className={cn('size-full', className)} aria-hidden="true">
      <path d="M9 3.5 h6" />
      <path d="M10.5 5 h3" />
      <path d="M12 5 C7.5 6.5 7.5 17.5 12 19 C16.5 17.5 16.5 6.5 12 5 Z" />
      <path d="M10 7.5 C9 10.5 9 13.5 10 16.5 M14 7.5 C15 10.5 15 13.5 14 16.5" opacity="0.6" />
      <path d="M12 19 v2" />
    </svg>
  );
}

/** Vận hạn — a la bàn (luopan / compass). */
export function IconLaBan({ className }: IconProps) {
  return (
    <svg {...base} className={cn('size-full', className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" opacity="0.4" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 5 L13.6 12 L12 19 L10.4 12 Z" />
      <path d="M12 3.4 v1.4 M12 19.2 v1.4 M3.4 12 h1.4 M19.2 12 h1.4" opacity="0.7" />
    </svg>
  );
}
