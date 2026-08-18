import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArticleCard } from '@/features/kien-thuc/components/article-card';
import {
  ARTICLE_CATEGORIES,
  ARTICLES,
  type ArticleCategory,
  formatArticleDate,
} from '@/features/kien-thuc/kien-thuc-data';

const ALL = 'Tất cả';
type Filter = typeof ALL | ArticleCategory;

const FILTERS: readonly Filter[] = [ALL, ...ARTICLE_CATEGORIES];

export function KienThucPage() {
  const [active, setActive] = useState<Filter>(ALL);
  const articles = active === ALL ? ARTICLES : ARTICLES.filter((item) => item.category === active);
  const [featured, ...rest] = articles;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Kiến thức</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
          Học tử vi từ gốc
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Những bài viết ngắn giải thích thuật ngữ và cách luận giải tử vi, phong thủy, tứ trụ —
          viết cho người mới bắt đầu.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            aria-pressed={active === filter}
            className={
              active === filter
                ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground'
                : 'rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground'
            }
          >
            {filter}
          </button>
        ))}
      </div>

      {featured && (
        <Link
          to="/kien-thuc/$slug"
          params={{ slug: featured.slug }}
          className="group mt-8 flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition hover:border-primary/50 hover:shadow-md"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            {featured.category}
          </span>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-snug text-foreground transition group-hover:text-primary md:text-4xl">
            {featured.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {featured.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <time dateTime={featured.date}>{formatArticleDate(featured.date)}</time>
            <span aria-hidden>·</span>
            <span>{featured.readingMinutes} phút đọc</span>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {rest.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
