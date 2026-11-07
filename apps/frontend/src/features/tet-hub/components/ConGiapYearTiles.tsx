import type { ReactElement } from 'react';
import { TET_HUB_VIEW_YEAR, tuoiNamFacts, tuoiNamSlug } from '@org/shared-tu-vi';
import { birthYearsOfChi } from '../con-giap-years';
import { tetHubPagePath } from '../tet-hub-paths';
import { TetHubChip } from './TetHubChip';
import { TetHubTile } from './TetHubTile';

const YEAR_TILES_TITLE_ID = 'con-giap-year-tiles-title';

interface ConGiapYearTilesProps {
  readonly chi: number;
  readonly chiName: string;
}

export function ConGiapYearTiles({ chi, chiName }: ConGiapYearTilesProps): ReactElement {
  return (
    <section aria-labelledby={YEAR_TILES_TITLE_ID}>
      <h2 id={YEAR_TILES_TITLE_ID} className="text-[22px] font-semibold text-[#2a1f0e]">
        Các năm sinh tuổi {chiName}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {birthYearsOfChi(chi).map((birthYear) => {
          const facts = tuoiNamFacts(birthYear, TET_HUB_VIEW_YEAR);
          return (
            <li key={birthYear}>
              <TetHubTile
                to={tetHubPagePath(tuoiNamSlug(birthYear))}
                title={`${facts.canChi} ${birthYear}`}
                subtitle={`Tuổi mụ ${facts.tuoi} · mệnh ${facts.menh.name}`}
              >
                <TetHubChip>Nam: sao {facts.nam.sao}</TetHubChip>
                <TetHubChip>Nữ: sao {facts.nu.sao}</TetHubChip>
              </TetHubTile>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
