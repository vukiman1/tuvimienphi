import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LuanGiaiChapterStatus, type BirthInput } from '@org/shared-contracts';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { luanGiaiQueries, requestChapter } from '@/features/la-so/luan-giai-queries';
import { LuanGiaiArticleCard } from '@/features/la-so/components/luan-giai-article';
import { LuanGiaiPendingCard } from '@/features/la-so/components/luan-giai-pending';
import { LuanGiaiPromptCard } from '@/features/la-so/components/luan-giai-prompt';
import { LuanGiaiSkeletonCard } from '@/features/la-so/components/luan-giai-skeleton';
import { DEFAULT_ERROR_MESSAGE, errorMessage } from '@/lib/api-error';

interface LuanGiaiChapterContentProps {
  readonly birth: BirthInput;
  readonly chapter: LuanGiaiChapter;
  readonly isRequested: boolean;
  readonly onRequest: () => void;
}

/** Bốn trạng thái của một mục: chưa xin → đang sinh → có bài, hoặc chưa biên soạn. */
export function LuanGiaiChapterContent({
  birth,
  chapter,
  isRequested,
  onRequest,
}: LuanGiaiChapterContentProps) {
  const queryClient = useQueryClient();
  const options = luanGiaiQueries.chapter(birth, chapter.order);
  const { data } = useQuery({ ...options, enabled: isRequested });

  const xin = useMutation({
    mutationFn: () => requestChapter(birth, chapter.order),
    onSuccess: (response) => {
      // Bài có sẵn thì đường POST trả luôn, khỏi phải chờ một vòng hỏi lại.
      queryClient.setQueryData(options.queryKey, response);
      onRequest();
    },
  });

  // Bài viết ra mất vài giây tới vài chục giây, nên chuyển sang khung chờ ngay khi bấm chứ không
  // chỉ khoá nút lại — nút xám đứng im lâu như vậy trông như trang bị treo.
  if (xin.isPending) {
    return <LuanGiaiSkeletonCard note="Đang luận giải từ lá số của bạn, mất khoảng 10–20 giây…" />;
  }

  if (!isRequested) {
    return (
      <LuanGiaiPromptCard
        chapter={chapter}
        error={xin.error ? errorMessage(xin.error, DEFAULT_ERROR_MESSAGE) : undefined}
        onRequest={() => xin.mutate()}
      />
    );
  }

  if (!data || data.status === LuanGiaiChapterStatus.Pending) {
    return <LuanGiaiSkeletonCard />;
  }

  if (data.status === LuanGiaiChapterStatus.Unavailable) {
    return <LuanGiaiPendingCard chapter={chapter} />;
  }

  return <LuanGiaiArticleCard article={data.article} order={chapter.order} />;
}
