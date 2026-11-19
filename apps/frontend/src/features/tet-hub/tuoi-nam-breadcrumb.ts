import { tuoiNamSlug, type TuoiNamFacts } from '@org/shared-tu-vi';
import type { BreadcrumbItem } from '@/lib/seo';
import { conGiapBreadcrumb } from './con-giap-breadcrumb';
import { tetHubPagePath } from './tet-hub-paths';

export function tuoiNamBreadcrumb(facts: TuoiNamFacts): readonly BreadcrumbItem[] {
  return [
    ...conGiapBreadcrumb(facts.chi),
    {
      name: `${facts.canChi} ${facts.birthYear}`,
      path: tetHubPagePath(tuoiNamSlug(facts.birthYear)),
    },
  ];
}
