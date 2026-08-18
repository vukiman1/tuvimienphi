import { createFileRoute } from '@tanstack/react-router';
import { ArticlePage } from '@/features/kien-thuc/pages/article-page';

export const Route = createFileRoute('/_site/kien-thuc/$slug')({
  component: ArticleRoute,
});

function ArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticlePage slug={slug} />;
}
