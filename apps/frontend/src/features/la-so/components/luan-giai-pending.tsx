import type { ReactElement } from 'react';
import { Orbit } from '@/design-system';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { LuanGiaiCard, LuanGiaiCardHeader } from '@/features/la-so/components/luan-giai-card';

interface LuanGiaiPendingCardProps {
  readonly chapter: LuanGiaiChapter;
}

const PENDING_ORBIT_POINTS = 6;

export function LuanGiaiPendingCard({ chapter }: LuanGiaiPendingCardProps): ReactElement {
  return (
    <LuanGiaiCard>
      <LuanGiaiCardHeader order={chapter.order} title={chapter.title} />

      <div className="flex min-h-75 flex-col items-center justify-center gap-4 py-10 text-center">
        <Orbit points={PENDING_ORBIT_POINTS} className="size-24 text-ink/20" />
        <p className="text-xl font-semibold text-ink">Nội dung đang được biên soạn</p>
        <p className="max-w-prose text-ink-soft">
          Phần luận giải cho mục này sẽ sớm có mặt. Trong lúc chờ, bạn có thể xem mục{' '}
          <span className="font-semibold text-ink">Thân cư</span> hoặc rê chuột lên lá số để xem tam
          hợp và xung chiếu của từng cung.
        </p>
      </div>
    </LuanGiaiCard>
  );
}
