import { CHI, conGiapSlug } from '@org/shared-tu-vi';
import type { BreadcrumbItem } from '@/lib/seo';
import { TET_HUB_BREADCRUMB } from './tet-hub-breadcrumb';
import { tetHubPagePath } from './tet-hub-paths';

export function conGiapBreadcrumb(chi: number): readonly BreadcrumbItem[] {
  return [
    ...TET_HUB_BREADCRUMB,
    { name: `Tuổi ${CHI[chi]}`, path: tetHubPagePath(conGiapSlug(chi)) },
  ];
}
