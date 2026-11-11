import type { ReactElement } from 'react';

const LOGO_MARK_SOURCE = '/brand/logo-mark-128.webp';
const LOGO_MARK_SOURCE_SET = '/brand/logo-mark-128.webp 1x, /brand/logo-mark-256.webp 2x';
const LOGO_MARK_INTRINSIC_SIZE = 128;

export function LogoMark({ className }: { readonly className?: string }): ReactElement {
  return (
    <img
      src={LOGO_MARK_SOURCE}
      srcSet={LOGO_MARK_SOURCE_SET}
      width={LOGO_MARK_INTRINSIC_SIZE}
      height={LOGO_MARK_INTRINSIC_SIZE}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={className}
    />
  );
}
