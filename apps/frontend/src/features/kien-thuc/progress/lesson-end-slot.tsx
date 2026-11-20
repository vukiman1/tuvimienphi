import type { ReactElement } from 'react';
import type { KienThucManifest } from '@org/shared-contracts';
import { ProgressCardSlot } from '../components/progress-card-slot';

interface LessonEndSlotProps {
  readonly manifest: KienThucManifest;
  readonly lessonSlug: string;
}

export function LessonEndSlot({ manifest, lessonSlug }: LessonEndSlotProps): ReactElement {
  return <ProgressCardSlot manifest={manifest} lessonSlug={lessonSlug} />;
}
