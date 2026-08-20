import { MEDIA } from '@/config/media';

export function PageLoader() {
  return (
    <main
      role="status"
      aria-label="Đang tải"
      className="flex flex-col items-center justify-center gap-4 py-24"
    >
      <img
        src={MEDIA.brand.icon}
        alt=""
        className="size-12 animate-spin [animation-duration:6s] motion-reduce:animate-none"
      />
      <span className="text-sm text-muted-foreground">Đang tải...</span>
    </main>
  );
}
