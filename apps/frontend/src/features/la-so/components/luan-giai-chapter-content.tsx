import { useQuery } from '@tanstack/react-query';
import { LuanGiaiContentKind, type LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { luanGiaiQueries } from '@/features/la-so/luan-giai-queries';
import { LuanGiaiArticleCard } from '@/features/la-so/components/luan-giai-article';
import { LuanGiaiPendingCard } from '@/features/la-so/components/luan-giai-pending';
import { LuanGiaiPromptCard } from '@/features/la-so/components/luan-giai-prompt';
import { LuanGiaiSkeletonCard } from '@/features/la-so/components/luan-giai-skeleton';
import { LuanGiaiVanHanCard } from '@/features/la-so/components/luan-giai-van-han';

interface LuanGiaiChapterContentProps {
  readonly chapter: LuanGiaiChapter;
  readonly isRequested: boolean;
  readonly onRequest: () => void;
}

/** Bốn trạng thái của một mục: chưa nạp → đang nạp → có bài, hoặc chưa biên soạn. */
export function LuanGiaiChapterContent({
  chapter,
  isRequested,
  onRequest,
}: LuanGiaiChapterContentProps) {
  const { data, isPending } = useQuery({
    ...luanGiaiQueries.chapter(chapter.order),
    enabled: isRequested,
  });

  if (!isRequested) {
    return <LuanGiaiPromptCard chapter={chapter} onRequest={onRequest} />;
  }

  if (isPending) {
    return <LuanGiaiSkeletonCard />;
  }

  if (!data) {
    return <LuanGiaiPendingCard chapter={chapter} />;
  }

  switch (data.kind) {
    case LuanGiaiContentKind.Article:
      return <LuanGiaiArticleCard article={data.article} order={chapter.order} />;
    case LuanGiaiContentKind.Periods:
      return (
        <LuanGiaiVanHanCard order={chapter.order} scales={data.scales} title={chapter.title} />
      );
  }
}
