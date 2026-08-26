import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  /** Chưa có ảnh thì đổ khối chờ, có rồi thì hiện ảnh — không phải sửa bố cục khi ráp ảnh thật. */
  readonly src?: string;
  readonly label: string;
  readonly ratio?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ImagePlaceholder({ src, label, ratio, className, style }: ImagePlaceholderProps) {
  if (src) {
    return (
      <img
        alt=""
        aria-hidden
        className={cn('h-full w-full object-contain', className)}
        src={src}
        style={style}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center border border-dashed border-[#c9a15c]/70 bg-[#f4ecd9]/60 px-2 text-center text-[11px] leading-tight text-[#a08356]',
        className,
      )}
      style={{ ...style, ...(ratio ? { aspectRatio: ratio } : undefined) }}
    >
      {label}
    </div>
  );
}
