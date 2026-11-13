import type { ReactElement } from 'react';
import { Eye } from 'lucide-react';
import { CtaButton, CtaTone } from '@/design-system';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';

interface LuanGiaiPromptCardProps {
  readonly chapter: LuanGiaiChapter;
  readonly onRequest: () => void;
  readonly error?: string;
  readonly actionLabel?: string;
}

const DEFAULT_ACTION_LABEL = 'Xem luận giải';

export function LuanGiaiPromptCard({
  chapter,
  onRequest,
  error,
  actionLabel = DEFAULT_ACTION_LABEL,
}: LuanGiaiPromptCardProps): ReactElement {
  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader order={chapter.order} title={chapter.title} />

      <div className="flex min-h-72 flex-col items-center justify-center gap-5 py-10 text-center">
        <p className="max-w-prose text-ink-soft">
          Mục này được phân tích riêng từ lá số của bạn. Bấm để xem — mất vài giây.
        </p>
        <CtaButton onClick={onRequest} tone={CtaTone.Gold}>
          <Eye aria-hidden className="size-4" />
          {actionLabel}
        </CtaButton>
        {error ? <p className="max-w-prose text-sm text-danger">{error}</p> : null}
      </div>
    </LuanGiaiCard>
  );
}
