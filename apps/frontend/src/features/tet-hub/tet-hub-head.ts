import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { TET_HUB_BREADCRUMB } from './tet-hub-breadcrumb';
import type { SeoHead } from '@/lib/seo';
import { articlePageHead } from './tet-hub-json-ld';
import { TET_HUB_PATH, TET_HUB_SLUG, tetHubShareImagePath } from './tet-hub-paths';

export const TET_HUB_PAGE_TITLE = `Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi: sao chiếu mệnh, hạn, Tam tai cho 12 con giáp`;
const TET_HUB_DESCRIPTION = `Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi: chọn con giáp để xem Tam tai, Thái tuế, tuổi xông đất và sao chiếu mệnh, hạn của từng năm sinh âm lịch.`;

export function tetHubHead(): SeoHead {
  return articlePageHead({
    title: TET_HUB_PAGE_TITLE,
    description: TET_HUB_DESCRIPTION,
    path: TET_HUB_PATH,
    image: tetHubShareImagePath(TET_HUB_SLUG),
    breadcrumb: TET_HUB_BREADCRUMB,
  });
}
