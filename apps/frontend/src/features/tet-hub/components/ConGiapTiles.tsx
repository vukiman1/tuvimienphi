import type { ReactElement } from 'react';
import { CHI, conGiapSlug } from '@org/shared-tu-vi';
import { birthYearsOfChi } from '../con-giap-years';
import { conGiapEmblem } from '../tet-hub-paintings';
import { tetHubPagePath } from '../tet-hub-paths';
import { TetHubTile, TileSurface } from './TetHubTile';

const CON_GIAP_TILES_TITLE_ID = 'con-giap-tiles-title';
const YEARS_SEPARATOR = ', ';

export function ConGiapTiles(): ReactElement {
  return (
    <section aria-labelledby={CON_GIAP_TILES_TITLE_ID}>
      <h2 id={CON_GIAP_TILES_TITLE_ID} className="text-xl font-bold">
        Chọn con giáp của bạn
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CHI.map((chiName, chi) => (
          <li key={chiName}>
            <TetHubTile
              to={tetHubPagePath(conGiapSlug(chi))}
              title={`Tuổi ${chiName}`}
              subtitle={birthYearsOfChi(chi).join(YEARS_SEPARATOR)}
              surface={TileSurface.Night}
              emblem={conGiapEmblem(chi)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
