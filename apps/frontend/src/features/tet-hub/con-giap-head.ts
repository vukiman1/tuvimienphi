import {
  CHI,
  TET_HUB_VIEW_YEAR,
  TUOI_NAM_FIRST_BIRTH_YEAR,
  TUOI_NAM_LAST_BIRTH_YEAR,
  conGiapSlug,
  getYearCanChi,
} from '@org/shared-tu-vi';
import type { ConGiapArticle } from '@org/shared-contracts';
import { conGiapBreadcrumb } from './con-giap-breadcrumb';
import { articlePageHead, type SeoHead } from './tet-hub-json-ld';
import { tetHubPagePath, tetHubShareImagePath } from './tet-hub-paths';

function conGiapTitle(chi: number): string {
  return `Tử vi tuổi ${CHI[chi]} năm ${TET_HUB_VIEW_YEAR}: Tam tai, Thái tuế, tuổi xông đất`;
}

function conGiapDescription(chi: number): string {
  return `Tuổi ${CHI[chi]} năm ${getYearCanChi(TET_HUB_VIEW_YEAR)} ${TET_HUB_VIEW_YEAR}: có phạm Tam tai, Thái tuế hay không, tuổi hợp xông đất và danh sách các năm sinh tuổi ${CHI[chi]} từ ${TUOI_NAM_FIRST_BIRTH_YEAR} đến ${TUOI_NAM_LAST_BIRTH_YEAR} kèm sao chiếu mệnh.`;
}

export function conGiapHead(chi: number, article: ConGiapArticle): SeoHead {
  return articlePageHead({
    title: conGiapTitle(chi),
    description: conGiapDescription(chi),
    path: tetHubPagePath(conGiapSlug(chi)),
    image: tetHubShareImagePath(conGiapSlug(chi)),
    generatedAt: article.generatedAt,
    breadcrumb: conGiapBreadcrumb(chi),
  });
}
