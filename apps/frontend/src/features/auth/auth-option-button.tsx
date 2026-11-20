import type { ComponentProps, ReactNode } from 'react';
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
        'relative h-10 w-full rounded-full border-[#e3d5c3] bg-white px-12 text-sm font-medium text-[#2b1d14] shadow-[0_1px_3px_rgba(60,40,15,0.08)] hover:border-[#c9a15c]/70 hover:bg-white/90 hover:text-[#2b1d14]',
        className,
      )}
      type="button"
      variant="outline"
      {...props}
    >
      <span className="absolute left-3 flex items-center">{icon}</span>
      {label}
    </Button>
  );
}
