import type { ReactElement } from 'react';
import { CHI, conGiapSlug } from '@org/shared-tu-vi';
import { birthYearsOfChi } from '../con-giap-years';
import { tetHubPagePath } from '../tet-hub-paths';
import { TetHubTile } from './TetHubTile';

const CON_GIAP_TILES_TITLE_ID = 'con-giap-tiles-title';
const YEARS_SEPARATOR = ', ';

export function ConGiapTiles(): ReactElement {
  return (
    <section aria-labelledby={CON_GIAP_TILES_TITLE_ID}>
      <h2 id={CON_GIAP_TILES_TITLE_ID} className="text-[22px] font-semibold text-[#2a1f0e]">
        Chọn con giáp của bạn
      </h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CHI.map((chiName, chi) => (
          <li key={chiName}>
            <TetHubTile
              to={tetHubPagePath(conGiapSlug(chi))}
              title={`Tuổi ${chiName}`}
              subtitle={birthYearsOfChi(chi).join(YEARS_SEPARATOR)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
