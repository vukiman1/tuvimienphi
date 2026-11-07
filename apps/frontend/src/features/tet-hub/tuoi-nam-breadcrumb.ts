import { CHI, conGiapSlug, tuoiNamSlug, type TuoiNamFacts } from '@org/shared-tu-vi';
import { KIEN_THUC_PATH, TET_HUB_PATH, TET_HUB_TITLE, tetHubPagePath } from './tet-hub-paths';

export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

export function tuoiNamBreadcrumb(facts: TuoiNamFacts): readonly BreadcrumbItem[] {
  return [
    { name: 'Kiến thức', path: KIEN_THUC_PATH },
    { name: TET_HUB_TITLE, path: TET_HUB_PATH },
    { name: `Tuổi ${CHI[facts.chi]}`, path: tetHubPagePath(conGiapSlug(facts.chi)) },
    {
      name: `${facts.canChi} ${facts.birthYear}`,
      path: tetHubPagePath(tuoiNamSlug(facts.birthYear)),
    },
  ];
}
