import { MEDIA } from '@/config/media';

interface PagePlaceholderProps {
  readonly title: string;
  readonly description: string;
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-20 text-center">
      <img src={MEDIA.brand.icon} alt="" className="mx-auto mb-6 size-16" />
      <h1 className="font-display text-4xl font-bold text-foreground">{title}</h1>
      <p className="mt-4 text-lg text-muted-foreground">{description}</p>
      <p className="mt-10 inline-block rounded-full border border-[#c9a15c]/40 px-5 py-1.5 text-sm text-muted-foreground">
        Tính năng đang được xây dựng
      </p>
    </main>
  );
}
