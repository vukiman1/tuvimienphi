import type { ReactElement } from 'react';
import { CHI, TET_HUB_VIEW_YEAR, tuoiNamFacts, tuoiNamSlug } from '@org/shared-tu-vi';
import { Chip, DisplaySize, DisplayTitle, TitleFace } from '@/design-system';
import { birthYearsOfChi } from '../con-giap-years';
import { tetHubPagePath } from '../tet-hub-paths';
import { TetHubTile, TileSurface } from './TetHubTile';

const YEAR_TILES_TITLE_ID = 'con-giap-year-tiles-title';

interface ConGiapYearTilesProps {
  readonly chi: number;
}

export function ConGiapYearTiles({ chi }: ConGiapYearTilesProps): ReactElement {
  return (
    <section aria-labelledby={YEAR_TILES_TITLE_ID} className="text-ink">
      <DisplayTitle id={YEAR_TILES_TITLE_ID} size={DisplaySize.Card} face={TitleFace.Serif}>
        Các năm sinh tuổi {CHI[chi]}
      </DisplayTitle>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {birthYearsOfChi(chi).map((birthYear) => {
          const facts = tuoiNamFacts(birthYear, TET_HUB_VIEW_YEAR);
          return (
            <li key={birthYear}>
              <TetHubTile
                to={tetHubPagePath(tuoiNamSlug(birthYear))}
                title={`${facts.canChi} ${birthYear}`}
                subtitle={`Tuổi mụ ${facts.tuoi} · mệnh ${facts.menh.name}`}
                surface={TileSurface.Day}
              >
                <Chip>Nam: sao {facts.nam.sao}</Chip>
                <Chip>Nữ: sao {facts.nu.sao}</Chip>
              </TetHubTile>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
