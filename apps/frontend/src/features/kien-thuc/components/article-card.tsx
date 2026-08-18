import { Link } from '@tanstack/react-router';
import { type Article, formatArticleDate } from '../kien-thuc-data';

interface ArticleCardProps {
  readonly article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      to="/kien-thuc/$slug"
      params={{ slug: article.slug }}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/50 hover:shadow-md"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">
        {article.category}
      </span>
      <h3 className="mt-3 font-display text-2xl font-semibold leading-snug text-foreground transition group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} phút đọc</span>
      </div>
    </Link>
  );
}
