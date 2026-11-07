import { TET_HUB_VIEW_YEAR } from '@org/shared-tu-vi';
import { jsonLdMeta, seo } from '@/lib/seo';
import type { BreadcrumbItem } from './breadcrumb-item';
import { articleJsonLd, breadcrumbJsonLd } from './tet-hub-json-ld';
import { KIEN_THUC_PATH, TET_HUB_PATH, TET_HUB_TITLE } from './tet-hub-paths';

type SeoHead = ReturnType<typeof seo>;

export const TET_HUB_PAGE_TITLE = `Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi: sao chiếu mệnh, hạn, Tam tai cho 12 con giáp`;
const TET_HUB_DESCRIPTION = `Tử vi ${TET_HUB_VIEW_YEAR} theo tuổi: chọn con giáp để xem Tam tai, Thái tuế, tuổi xông đất và sao chiếu mệnh, hạn của từng năm sinh âm lịch.`;

export const TET_HUB_BREADCRUMB: readonly BreadcrumbItem[] = [
  { name: 'Kiến thức', path: KIEN_THUC_PATH },
  { name: TET_HUB_TITLE, path: TET_HUB_PATH },
];

export function tetHubHead(): SeoHead {
  const base = seo({
    title: TET_HUB_PAGE_TITLE,
    description: TET_HUB_DESCRIPTION,
    path: TET_HUB_PATH,
    type: 'article',
  });
  return {
    ...base,
    meta: [
      ...base.meta,
      jsonLdMeta(
        articleJsonLd({
          headline: TET_HUB_PAGE_TITLE,
          description: TET_HUB_DESCRIPTION,
          path: TET_HUB_PATH,
        }),
      ),
      jsonLdMeta(breadcrumbJsonLd(TET_HUB_BREADCRUMB)),
    ],
  };
}
