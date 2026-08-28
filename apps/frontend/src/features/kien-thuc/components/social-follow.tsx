import { memo, type ComponentType, type SVGProps } from 'react';
import { Panel, PanelHeading } from '@/features/kien-thuc/components/panel';
import { cn } from '@/lib/utils';

// lucide dropped its brand glyphs, so the socials carry their own minimal marks.
type BrandIconProps = SVGProps<SVGSVGElement>;

function FacebookIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M15.12 5.32H17V2.14A26.1 26.1 0 0 0 14.26 2c-2.72 0-4.58 1.66-4.58 4.7v2.6H6.6v3.56h3.08V22h3.68v-9.14h3.06l.46-3.56h-3.52V7.05c0-1.03.28-1.73 1.76-1.73Z" />
    </svg>
  );
}

function YoutubeIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.86 12 3.86 12 3.86s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.5C0 8.38 0 12 0 12s0 3.62.5 5.5a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5A3.02 3.02 0 0 0 23.5 17.5c.5-1.88.5-5.5.5-5.5s0-3.62-.5-5.5ZM9.6 15.6V8.4l6.27 3.6-6.27 3.6Z" />
    </svg>
  );
}

function TiktokIcon(props: BrandIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.59 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1-2.59-2.59 2.59 2.59 0 0 1 3.4-2.46V9.71a5.67 5.67 0 0 0-.81-.06 5.66 5.66 0 1 0 5.66 5.66V8.99a7.29 7.29 0 0 0 4.27 1.37V7.27a4.28 4.28 0 0 1-3.24-1.45Z" />
    </svg>
  );
}

function InstagramIcon(props: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden
      {...props}
    >
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Each button wears its platform's real brand colour, icon in white.
const SOCIALS: readonly {
  readonly label: string;
  readonly Icon: ComponentType<BrandIconProps>;
  readonly brand: string;
}[] = [
  { label: 'Facebook', Icon: FacebookIcon, brand: 'bg-[#1877F2]' },
  { label: 'YouTube', Icon: YoutubeIcon, brand: 'bg-[#FF0000]' },
  { label: 'TikTok', Icon: TiktokIcon, brand: 'bg-[#010101]' },
  {
    label: 'Instagram',
    Icon: InstagramIcon,
    brand: 'bg-[linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf,#4f5bd5)]',
  },
];

/** Sidebar row of circular social buttons, each in its platform's brand colour. */
export const SocialFollow = memo(function SocialFollow() {
  return (
    <Panel>
      <PanelHeading>Theo dõi chúng tôi</PanelHeading>
      <div className="flex items-center gap-3">
        {SOCIALS.map(({ label, Icon, brand }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className={cn(
              'flex size-11 items-center justify-center rounded-full text-white shadow-sm transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[#e0bd76] focus-visible:outline-none',
              brand,
            )}
          >
            <Icon className="size-5" />
          </button>
        ))}
      </div>
    </Panel>
  );
});
