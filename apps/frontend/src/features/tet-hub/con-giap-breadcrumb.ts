import { CHI, conGiapSlug } from '@org/shared-tu-vi';
import type { BreadcrumbItem } from './breadcrumb-item';
import { KIEN_THUC_PATH, TET_HUB_PATH, TET_HUB_TITLE, tetHubPagePath } from './tet-hub-paths';

export function conGiapBreadcrumb(chi: number): readonly BreadcrumbItem[] {
  return [
    { name: 'Kiến thức', path: KIEN_THUC_PATH },
    { name: TET_HUB_TITLE, path: TET_HUB_PATH },
    { name: `Tuổi ${CHI[chi]}`, path: tetHubPagePath(conGiapSlug(chi)) },
  ];
}
