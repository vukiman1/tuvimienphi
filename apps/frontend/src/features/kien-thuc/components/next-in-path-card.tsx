import { useId } from 'react';
import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, BookOpen } from 'lucide-react';
import { FOCUS_RING_CLASS } from '@/design-system';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { cn } from '@/lib/utils';
import { NextInPathKind } from '../path-progress';
import type { NextInPath } from '../path-progress';
import { useMarkReadOnView } from '../progress/use-mark-read-on-view';

const LESSON_ROUTE = '/kien-thuc/$slug';

const LABEL_CLASS = 'text-sm font-bold text-ink-soft';

const CARD_LINK_CLASS = cn(
  'inline-flex min-h-11 items-center font-emphasis text-xl font-bold text-ink no-underline after:absolute after:inset-0 after:rounded-2xl hover:underline',
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
      className="relative flex items-center gap-4 self-stretch rounded-2xl border border-gold bg-day px-4 py-4 text-ink md:px-6"
    >
      <span
        aria-hidden="true"
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-day-200"
      >
        <BookOpen className="size-6 stroke-ink" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <NextInPathBody next={next} labelId={labelId} />
      </div>
      <ArrowRight aria-hidden="true" className="size-5 shrink-0 stroke-ink" />
    </section>
  );
}
