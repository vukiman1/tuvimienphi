import { Link } from '@tanstack/react-router';
import { categoryLabel, findArticle, formatArticleDate } from '@/features/kien-thuc/kien-thuc-data';

interface ArticlePageProps {
  readonly slug: string;
}

export function ArticlePage({ slug }: ArticlePageProps) {
  const article = findArticle(slug);

  if (!article) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-[22px] font-semibold text-foreground">
          Không tìm thấy bài viết
        </h1>
        <p className="mt-3 text-[13px] text-muted-foreground">
          Bài viết bạn tìm không tồn tại hoặc đã được đổi tên.
        </p>
        <Link
          to="/kien-thuc"
          className="mt-8 inline-block text-[13px] font-medium text-primary hover:underline"
        >
          ← Về trang Kiến Thức
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6">
      <Link
        to="/kien-thuc"
        className="text-[13px] font-medium text-muted-foreground transition hover:text-primary"
      >
        ← Kiến Thức
      </Link>

      <article className="mt-6">
        <span className="text-[12px] font-semibold uppercase tracking-widest text-primary">
          {categoryLabel(article.category)}
        </span>
        <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight text-foreground">
          {article.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-[12px] text-muted-foreground">
          <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
          <span aria-hidden>·</span>
          <span>{article.readingMinutes} phút đọc</span>
        </div>

        <div className="mt-8 flex flex-col gap-5 border-t border-border pt-8 text-[15px] leading-relaxed text-foreground/90">
          {article.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <Link
        to="/kien-thuc"
        className="mt-12 inline-block text-[13px] font-medium text-primary hover:underline"
      >
        ← Về trang Kiến Thức
      </Link>
    </main>
  );
}
