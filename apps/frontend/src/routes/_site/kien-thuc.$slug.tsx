import { createFileRoute } from '@tanstack/react-router';
import { ArticlePage } from '@/features/kien-thuc/pages/article-page';
import { findArticle } from '@/features/kien-thuc/kien-thuc-data';
import { SITE_NAME, absoluteUrl, jsonLdMeta, seo } from '@/lib/seo';

export const Route = createFileRoute('/_site/kien-thuc/$slug')({
  component: ArticleRoute,
  head: ({ params }) => {
    const article = findArticle(params.slug);
    if (!article) {
      return seo({
        title: 'Không tìm thấy bài viết',
        description: 'Bài viết bạn tìm không tồn tại hoặc đã được đổi tên.',
        path: `/kien-thuc/${params.slug}`,
        noindex: true,
      });
    }

    const path = `/kien-thuc/${article.slug}`;
    const base = seo({
      title: article.title,
      description: article.excerpt,
      path,
      type: 'article',
    });
    return {
      ...base,
      meta: [
        ...base.meta,
        jsonLdMeta({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: article.excerpt,
          datePublished: article.date,
          url: absoluteUrl(path),
          author: { '@type': 'Organization', name: SITE_NAME },
          publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: { '@type': 'ImageObject', url: absoluteUrl('/brand/icon.png') },
          },
        }),
      ],
    };
  },
});

function ArticleRoute() {
  const { slug } = Route.useParams();
  return <ArticlePage slug={slug} />;
}
