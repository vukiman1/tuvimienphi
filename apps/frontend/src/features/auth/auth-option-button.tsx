import type { ComponentProps, ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthOptionButtonProps extends Omit<
  ComponentProps<typeof Button>,
  'children' | 'type' | 'variant' | 'size'
> {
  icon: ReactNode;
  label: string;
}

export function AuthOptionButton({ icon, label, className, ...props }: AuthOptionButtonProps) {
  return (
    <Button
      className={cn(
        'relative h-[2.75rem] w-full rounded-xl border-[#e3d5c3] bg-white/60 px-14 font-display text-[1.05rem] font-semibold text-[#2b1d14] shadow-[0_1px_3px_rgba(60,40,15,0.08)] hover:border-[#c9a15c]/70 hover:bg-white/90 hover:text-[#2b1d14]',
        className,
      )}
      type="button"
      variant="outline"
      {...props}
    >
      <span className="absolute left-5 flex items-center">{icon}</span>
      {label}
      <span className="absolute right-5 flex items-center text-[#8a7866]">
        <ArrowRight className="size-4" />
      </span>
    </Button>
  );
}
