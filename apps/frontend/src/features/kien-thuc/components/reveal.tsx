import type { ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';

interface RevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Delay (ms) before this block eases in — used to stagger neighbouring reveals. */
  readonly delay?: number;
}

/**
 * Eases its children up into view the first time they scroll onto screen (opacity + translateY).
 * A one-shot, transform/opacity-only reveal; fully disabled under prefers-reduced-motion.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out will-change-transform',
        'motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none',
        revealed ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
