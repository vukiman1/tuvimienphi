import type { ReactElement } from 'react';
import { SITE_NAME } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { LOGO_WORDMARK_CLASS, type LogoTone } from './logo-tone';
import { LogoMark } from './LogoMark';

interface LogoProps {
  readonly tone: LogoTone;
  readonly className?: string;
}

export function Logo({ tone, className }: LogoProps): ReactElement {
  return (
    <span
      role="img"
      aria-label={SITE_NAME}
      className={cn(
        'inline-flex items-center gap-[0.32em] font-display font-extrabold tracking-display whitespace-nowrap [word-spacing:0.12em]',
        LOGO_WORDMARK_CLASS[tone],
        className,
      )}
    >
      <LogoMark className="size-[1.3em] shrink-0" />
      <span>{SITE_NAME}</span>
    </span>
  );
}
