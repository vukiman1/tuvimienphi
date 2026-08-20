import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Size of the corner cut. One number drives every layer, so the outlines stay concentric. */
const NOTCH = '14px';

const NOTCHED_CLIP = [
  `polygon(${NOTCH} 0,`,
  `calc(100% - ${NOTCH}) 0,`,
  `100% ${NOTCH},`,
  `100% calc(100% - ${NOTCH}),`,
  `calc(100% - ${NOTCH}) 100%,`,
  `${NOTCH} 100%,`,
  `0 calc(100% - ${NOTCH}),`,
  `0 ${NOTCH})`,
].join(' ');

const CLIP_STYLE = { clipPath: NOTCHED_CLIP } as const;

interface NotchedFrameProps {
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * The double gold outline with cut corners. Built from stacked clipped layers rather than borders:
 * a border would keep square corners where the clip cuts them away.
 */
export function NotchedFrame({ children, className }: NotchedFrameProps) {
  return (
    <div className="h-full bg-[#c9a15c]/85 p-px" style={CLIP_STYLE}>
      <div className="h-full bg-[#fdf9f0] p-[6px]" style={CLIP_STYLE}>
        <div className="h-full bg-[#c9a15c]/70 p-px" style={CLIP_STYLE}>
          <div className={cn('h-full bg-[#fdf9f0]', className)} style={CLIP_STYLE}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
