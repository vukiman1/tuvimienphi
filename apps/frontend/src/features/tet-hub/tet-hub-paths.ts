import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { KIEN_THUC_PATH } from '../kien-thuc/kien-thuc-paths';

export const TET_HUB_SLUG = `tu-vi-${TET_HUB_VIEW_YEAR}`;
export const TET_HUB_PATH = `${KIEN_THUC_PATH}/${TET_HUB_SLUG}`;
export const TET_HUB_TITLE = `Tử vi ${TET_HUB_VIEW_YEAR}`;
export const TET_HUB_LINK_LABEL = `${TET_HUB_TITLE} theo tuổi`;

export const TET_HUB_SLUG_ROUTE = '/kien-thuc/tu-vi-2027/$slug';

export function tetHubPagePath(slug: string): string {
  return `${TET_HUB_PATH}/${slug}`;
}

export const NAM_MANG_ANCHOR = 'nam-mang';
export const NU_MANG_ANCHOR = 'nu-mang';

export function tetHubShareImagePath(pageSlug: string): string {
  return `/tet/og/${pageSlug}.jpg`;
}
