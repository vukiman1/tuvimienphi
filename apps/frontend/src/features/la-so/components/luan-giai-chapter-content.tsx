import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LuanGiaiChapterStatus,
  type BirthInput,
  type LuanGiaiChapterStatusMap,
} from '@org/shared-contracts';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { luanGiaiQueries, requestChapter } from '@/features/la-so/luan-giai-queries';
import { LuanGiaiArticleCard } from '@/features/la-so/components/luan-giai-article';
import { LuanGiaiPendingCard } from '@/features/la-so/components/luan-giai-pending';
import { LuanGiaiPromptCard } from '@/features/la-so/components/luan-giai-prompt';
import { LuanGiaiSkeletonCard } from '@/features/la-so/components/luan-giai-skeleton';
import { DEFAULT_ERROR_MESSAGE, errorMessage } from '@/lib/api-error';

/**
 * Đúng năm bước máy chủ thực sự đi qua, theo đúng thứ tự. Nhịp hiện ra là ước lượng — máy chủ làm
 * xong mới trả một lần nên không có đường nào báo về đang ở bước nào.
 *
 * Hằng số ở tầng module để tham chiếu không đổi giữa các lần render, nếu không bộ đếm bước bị đặt
 * lại mỗi lần cha vẽ lại.
 */
const CAC_BUOC = [
  'Đang dựng lá số từ ngày giờ sinh',
  'Đang đọc thế cung an Thân',
  'Đang đối chiếu sao, bậc và thế hội chiếu',
  'Đang viết luận giải',
  'Đang soát lại bài viết',
] as const;

interface LuanGiaiChapterContentProps {
  readonly birth: BirthInput;
  readonly chapter: LuanGiaiChapter;
  /** Chưa biết thì để trống — lúc đó hiện khung chờ chứ đừng đoán là chưa có bài. */
  readonly status?: LuanGiaiChapterStatus;
}

/**
 * Chương đã sinh thì mở thẳng khi vào trang; chương chưa sinh thì khoá lại, bấm mới sinh. Bài lưu
 * theo lá số nên lần thứ hai xem cùng lá số đó là đọc ngay, không gọi mô hình và không trừ suất.
 */
export function LuanGiaiChapterContent({ birth, chapter, status }: LuanGiaiChapterContentProps) {
  const queryClient = useQueryClient();
  const options = luanGiaiQueries.chapter(birth, chapter.order);
  const daCoBai = status === LuanGiaiChapterStatus.Ready;
  const { data } = useQuery({ ...options, enabled: daCoBai });

  const xin = useMutation({
    mutationFn: () => requestChapter(birth, chapter.order),
    onSuccess: (response) => {
      if (response.status !== LuanGiaiChapterStatus.Ready) return;
      queryClient.setQueryData(options.queryKey, response);
      // Gỡ ổ khoá trên mục lục ngay tại chỗ, khỏi phải hỏi lại máy chủ một vòng nữa.
      queryClient.setQueryData<LuanGiaiChapterStatusMap>(
        luanGiaiQueries.statusMap(birth).queryKey,
        (cu) =>
          cu && {
            chapters: { ...cu.chapters, [chapter.order]: LuanGiaiChapterStatus.Ready },
          },
      );
    },
  });

  if (xin.isPending) {
    return <LuanGiaiSkeletonCard steps={CAC_BUOC} />;
  }

  if (status === undefined || (daCoBai && !data)) {
    return <LuanGiaiSkeletonCard />;
  }

  if (status === LuanGiaiChapterStatus.Unavailable) {
    return <LuanGiaiPendingCard chapter={chapter} />;
  }

  if (data?.status === LuanGiaiChapterStatus.Ready) {
    return <LuanGiaiArticleCard article={data.article} order={chapter.order} />;
  }

  return (
    <LuanGiaiPromptCard
      chapter={chapter}
      error={xin.error ? errorMessage(xin.error, DEFAULT_ERROR_MESSAGE) : undefined}
      onRequest={() => xin.mutate()}
    />
  );
}
