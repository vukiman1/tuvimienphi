import type { ReactElement } from 'react';
import { ChapterRail, StickyCta } from '@/design-system';
import { KnowledgeChapter } from '@/features/home/components/story/KnowledgeChapter';
import { MapChapter } from '@/features/home/components/story/MapChapter';
import { MomentChapter } from '@/features/home/components/story/MomentChapter';
import { OpeningChapter } from '@/features/home/components/story/OpeningChapter';
import { TruthsChapter } from '@/features/home/components/story/TruthsChapter';
import { TurnChapter } from '@/features/home/components/story/TurnChapter';
import { YourStoryChapter } from '@/features/home/components/story/YourStoryChapter';
import { BIRTH_FORM_ANCHOR } from '@/features/home/home-anchors';
import { OPENING } from '@/features/home/home-content';
import type { Gender } from '@/features/la-so/birth-input';

interface HomePageProps {
  readonly initialGender?: Gender;
  readonly viewYear?: number;
}

export function HomePage({ initialGender, viewYear }: HomePageProps = {}): ReactElement {
  return (
    <main>
      <ChapterRail />
      <StickyCta to="/" hash={BIRTH_FORM_ANCHOR}>
        {OPENING.stickyLabel} <span aria-hidden="true">↗</span>
      </StickyCta>
      <OpeningChapter />
      <MomentChapter />
      <MapChapter />
      <TurnChapter />
      <TruthsChapter />
      <KnowledgeChapter />
      <YourStoryChapter initialGender={initialGender} viewYear={viewYear} />
    </main>
  );
}
