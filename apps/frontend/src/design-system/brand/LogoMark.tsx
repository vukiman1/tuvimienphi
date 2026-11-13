import type { ReactElement } from 'react';

const LOGO_MARK_SOURCE = '/brand/logo-mark-128.webp';
const LOGO_MARK_SOURCE_SET =
  '/brand/logo-mark-64.webp 64w, /brand/logo-mark-128.webp 128w, /brand/logo-mark-256.webp 256w';
const LOGO_MARK_INTRINSIC_SIZE = 128;
const DEFAULT_DISPLAY_SIZE = '4rem';

interface LogoMarkProps {
  readonly className?: string;
  readonly displaySize?: string;
}

export function LogoMark({
  className,
  displaySize = DEFAULT_DISPLAY_SIZE,
}: LogoMarkProps): ReactElement {
  return (
    <img
      src={LOGO_MARK_SOURCE}
      srcSet={LOGO_MARK_SOURCE_SET}
      sizes={displaySize}
      width={LOGO_MARK_INTRINSIC_SIZE}
      height={LOGO_MARK_INTRINSIC_SIZE}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={className}
    />
  );
}
