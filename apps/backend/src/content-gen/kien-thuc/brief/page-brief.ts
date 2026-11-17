import type { PageRef } from '@org/shared-contracts';
import type { PlannedPage } from '@org/shared-kien-thuc';
import type { PageLimits } from '../validate/check-shape';

export interface LinkTarget {
  readonly ref: PageRef;
  readonly title: string;
}

export interface PageBrief {
  readonly page: PlannedPage;
  readonly limits: PageLimits;
  readonly factLines: readonly string[];
  readonly mustCover: readonly string[];
  readonly requiredMentions: readonly string[];
  readonly linkTargets: readonly LinkTarget[];
  readonly ownedElsewhere: readonly LinkTarget[];
  readonly previous: LinkTarget | null;
  readonly next: LinkTarget | null;
  readonly teachingLesson: LinkTarget | null;
}
