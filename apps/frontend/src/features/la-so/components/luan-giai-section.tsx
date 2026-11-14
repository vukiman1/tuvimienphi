import { Fragment, type ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isYearDependentChapter, type BirthInput } from '@org/shared-contracts';
import { DisplaySize, DisplayTitle, Orbit, ReadingZone, TitleFace } from '@/design-system';
import { luanGiaiQueries } from '@/features/la-so/luan-giai-queries';
import type { LuanGiaiChapter } from '@/features/la-so/luan-giai-data';
import { LuanGiaiChapterContent } from '@/features/la-so/components/luan-giai-chapter-content';
import { LuanGiaiChapters } from '@/features/la-so/components/luan-giai-chapters';

interface LuanGiaiSectionProps {
  readonly birth: BirthInput;
  readonly viewYear: number;
  readonly chapters: readonly LuanGiaiChapter[];
  readonly motto: readonly string[];
  readonly activeChapter: string;
  readonly onSelectChapter: (order: string) => void;
}

const MOTTO_ORBIT_RINGS = 2;

export const LUAN_GIAI_ANCHOR_ID = 'luan-giai';

export function LuanGiaiSection({
  birth,
  viewYear,
  chapters,
  motto,
  activeChapter,
  onSelectChapter,
}: LuanGiaiSectionProps): ReactElement {
  const chapter = chapters.find((item) => item.order === activeChapter) ?? chapters[0];
  const { data: trangThai } = useQuery(luanGiaiQueries.statusMap(birth, viewYear));

  return (
    <section className="bg-deep text-day">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 md:px-6">
        <div className="text-center" id={LUAN_GIAI_ANCHOR_ID} tabIndex={-1}>
          <DisplayTitle as="h2" face={TitleFace.Serif} size={DisplaySize.Card}>
            Luận giải lá số
          </DisplayTitle>
        </div>
        <div className="mt-8">
          <LuanGiaiChapters
            activeOrder={activeChapter}
            chapters={chapters}
            statuses={trangThai?.chapters}
            onSelect={onSelectChapter}
          />
        </div>
      </div>

      <div className="bg-day px-4 py-10 md:px-6">
        <ReadingZone>
          <LuanGiaiChapterContent
            key={
              isYearDependentChapter(chapter.order) ? `${chapter.order}:${viewYear}` : chapter.order
            }
            birth={birth}
            chapter={chapter}
            status={trangThai?.chapters[chapter.order]}
            viewYear={viewYear}
          />
        </ReadingZone>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-day-soft">
          {motto.map((line, index) => (
            <Fragment key={line}>
              {index > 0 && (
                <span className="flex basis-full justify-center md:basis-auto">
                  <Orbit rings={MOTTO_ORBIT_RINGS} className="size-8 text-gold/60" />
                </span>
              )}
              <span>{line}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
