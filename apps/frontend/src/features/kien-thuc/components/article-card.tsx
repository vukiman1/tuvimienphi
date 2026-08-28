import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import { CalendarDays, Eye } from 'lucide-react';
import {
  type Article,
  categoryLabel,
  formatArticleDate,
  formatViews,
} from '@/features/kien-thuc/kien-thuc-data';
import { MEDIA } from '@/config/media';

interface ArticleCardProps {
  readonly article: Article;
  /** Grid position, used to stagger the entrance animation. */
  readonly index?: number;
}

/** A latest-articles grid tile: cover image, topic tag, headline, then date and view count. */
export const ArticleCard = memo(function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  return (
    <Link
      to="/kien-thuc/$slug"
      params={{ slug: article.slug }}
      style={{ animationDelay: `${index * 70}ms` }}
      className="group flex animate-in flex-col overflow-hidden rounded-xl border border-[#e7d9bf] bg-card shadow-sm transition duration-500 fade-in slide-in-from-bottom-3 [animation-fill-mode:backwards] hover:-translate-y-0.5 hover:border-[#c9a15c]/60 hover:shadow-md motion-reduce:animate-none"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#efe4cd]">
        <img
          src={article.thumbnail}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-bold tracking-wide text-[#f6e3b6] uppercase backdrop-blur-sm">
          {categoryLabel(article.category)}
        </span>
        {/* A cinnabar seal stamp in the corner — the site's 紫微免費 mark. */}
        <img
          src={MEDIA.laSo.sealSmall}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute right-2.5 bottom-2.5 size-9 opacity-85 mix-blend-multiply"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-[#2a1f0e] transition-colors group-hover:text-[#9e2b1e]">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-[13px] text-[#8d7a5c]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatArticleDate(article.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="size-3.5" />
            {formatViews(article.views)}
          </span>
        </div>
      </div>
    </Link>
  );
});
