import type { ReactElement } from 'react';
import { ArrowRight } from 'lucide-react';
import type { KienThucManifest } from '@org/shared-contracts';
import { CtaButton, CtaTone } from '@/design-system';
import { ResumeKind, resumePoint } from '../path-progress';
import type { Resume } from '../path-progress';
import { useLessonProgress } from '../progress/use-lesson-progress';

const LESSON_ROUTE = '/kien-thuc/$slug';

interface HeroStartButtonProps {
  readonly manifest: KienThucManifest;
}

function resumeLabel(resume: Resume): string {
  switch (resume.kind) {
    case ResumeKind.Start:
      return `Bắt đầu bước ${resume.lesson.step}`;
    case ResumeKind.Continue:
      return `Học tiếp: Bước ${resume.step.step} · ${resume.step.title}`;
    case ResumeKind.Review:
      return `Đọc lại từ bước ${resume.lesson.step}`;
  }
}

export function HeroStartButton({ manifest }: HeroStartButtonProps): ReactElement | null {
  const { readSlugs } = useLessonProgress();
  const resume = resumePoint(manifest, readSlugs);
  if (!resume) {
    return null;
  }
  return (
    <div className="flex min-h-20 items-start sm:min-h-13">
      <CtaButton to={LESSON_ROUTE} params={{ slug: resume.lesson.slug }} tone={CtaTone.Gold}>
        {resumeLabel(resume)}
        <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
      </CtaButton>
    </div>
  );
}
