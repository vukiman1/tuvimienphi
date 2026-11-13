import type { ReactElement, ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { FOCUS_RING_CLASS } from './focus-ring';

export enum CtaTone {
  Gold = 'gold',
  Outline = 'outline',
}

const CTA_BASE_CLASS =
  'inline-flex min-h-13 items-center justify-center gap-3 rounded-full border px-6 text-xs font-bold tracking-[0.08em] uppercase no-underline transition-transform hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0';

const CTA_TONE_CLASS: Readonly<Record<CtaTone, string>> = {
  [CtaTone.Gold]: 'border-transparent bg-gold text-ink',
  [CtaTone.Outline]: 'border-current bg-transparent',
};

interface CtaBaseProps {
  readonly tone: CtaTone;
  readonly children: ReactNode;
  readonly isFullWidth?: boolean;
}

interface CtaLinkProps extends CtaBaseProps {
  readonly to: LinkProps['to'];
  readonly search?: LinkProps['search'];
  readonly hash?: string;
}

interface CtaActionProps extends CtaBaseProps {
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit';
}

export type CtaButtonProps = CtaLinkProps | CtaActionProps;

function isLinkCta(props: CtaButtonProps): props is CtaLinkProps {
  return 'to' in props;
}

export function CtaButton(props: CtaButtonProps): ReactElement {
  const className = cn(
    CTA_BASE_CLASS,
    FOCUS_RING_CLASS,
    CTA_TONE_CLASS[props.tone],
    props.isFullWidth === true && 'w-full',
  );
  if (isLinkCta(props)) {
    return (
      <Link to={props.to} search={props.search} hash={props.hash} className={className}>
        {props.children}
      </Link>
    );
  }
  return (
    <button type={props.type ?? 'button'} onClick={props.onClick} className={className}>
      {props.children}
    </button>
  );
}
