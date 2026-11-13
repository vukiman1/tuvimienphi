import type { ReactElement } from 'react';
import {
  CHI,
  TUOI_NAM_FIRST_BIRTH_YEAR,
  TUOI_NAM_LAST_BIRTH_YEAR,
  conGiapSlug,
  getYearCanChi,
  tuoiNamSlug,
  type TuoiNamFacts,
} from '@org/shared-tu-vi';
import { TET_HUB_PATH, TET_HUB_TITLE, tetHubPagePath } from '../tet-hub-paths';
import { TetHubTile, TileSurface } from './TetHubTile';

const RELATED_TITLE_ID = 'tuoi-nam-related-title';
const NEIGHBOUR_OFFSETS: readonly number[] = [-2, -1, 1, 2];

interface TuoiNamRelatedProps {
  readonly facts: TuoiNamFacts;
}

interface RelatedLink {
  readonly path: string;
  readonly label: string;
}

function isInRange(birthYear: number): boolean {
  return birthYear >= TUOI_NAM_FIRST_BIRTH_YEAR && birthYear <= TUOI_NAM_LAST_BIRTH_YEAR;
}

function relatedLinks(facts: TuoiNamFacts): readonly RelatedLink[] {
  const neighbours = NEIGHBOUR_OFFSETS.map((offset) => facts.birthYear + offset)
    .filter(isInRange)
    .map((birthYear) => ({
      path: tetHubPagePath(tuoiNamSlug(birthYear)),
      label: `Tuổi ${getYearCanChi(birthYear)} ${birthYear}`,
    }));
  return [
    ...neighbours,
    {
      path: tetHubPagePath(conGiapSlug(facts.chi)),
      label: `Tử vi tuổi ${CHI[facts.chi]} năm ${facts.viewYear}`,
    },
    { path: TET_HUB_PATH, label: `${TET_HUB_TITLE} theo tuổi` },
  ];
}

export function TuoiNamRelated({ facts }: TuoiNamRelatedProps): ReactElement {
  return (
    <nav aria-labelledby={RELATED_TITLE_ID} className="text-ink">
      <h2 id={RELATED_TITLE_ID} className="text-xl font-bold">
        Xem thêm
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {relatedLinks(facts).map(({ path, label }) => (
          <li key={path}>
            <TetHubTile to={path} title={label} surface={TileSurface.Day} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
