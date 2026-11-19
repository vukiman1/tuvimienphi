import { useId } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { FOCUS_RING_CLASS } from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { cn } from '@/lib/utils';
import { NextInPathKind } from '../path-progress';
import type { NextInPath } from '../path-progress';
import { useMarkReadOnView } from '../progress/use-mark-read-on-view';

const LESSON_ROUTE = '/kien-thuc/$slug';

const LABEL_CLASS = 'text-sm font-bold text-ink-soft';

const CARD_LINK_CLASS = cn(
  'inline-flex min-h-11 items-center border-b border-current text-xl font-bold text-ink no-underline',
  FOCUS_RING_CLASS,
);

interface NextInPathCardProps {
  readonly slug: string;
  readonly next: NextInPath;
}

interface NextInPathBodyProps {
  readonly next: NextInPath;
  readonly labelId: string;
}

function NextInPathBody({ next, labelId }: NextInPathBodyProps): ReactElement {
  if (next.kind === NextInPathKind.End) {
    return (
      <Link id={labelId} to="/" hash={BIRTH_FORM_ANCHOR} className={CARD_LINK_CLASS}>
        Lập lá số và đọc theo những gì đã học
      </Link>
    );
  }
  const { lesson } = next;
  const isNewStep = next.kind === NextInPathKind.Step;
  return (
    <>
      <p id={labelId} className={LABEL_CLASS}>
        {isNewStep ? 'Bước tiếp theo' : 'Bài tiếp theo'}
      </p>
      <Link to={LESSON_ROUTE} params={{ slug: lesson.slug }} className={CARD_LINK_CLASS}>
        {isNewStep ? `Bước ${lesson.step} · ${lesson.stepTitle}` : lesson.title}
      </Link>
      {isNewStep && <p className="text-base text-ink-soft">{lesson.title}</p>}
    </>
  );
}

export function NextInPathCard({ slug, next }: NextInPathCardProps): ReactElement {
  const markReadRef = useMarkReadOnView(slug);
  const labelId = useId();
  return (
    <section
      ref={markReadRef}
      aria-labelledby={labelId}
      className="flex flex-col items-start gap-2 self-stretch rounded-2xl bg-day-200 px-6 py-6 text-ink"
    >
      <NextInPathBody next={next} labelId={labelId} />
    </section>
  );
}
