import { ContentKind } from '@org/shared-contracts';
import type { EntryKind } from '@org/shared-contracts';
import { breadcrumbJsonLd, jsonLdMeta, seo, type SeoHead } from '@/lib/seo';
import { KIND_INDEX_DESCRIPTION, KIND_INDEX_TITLE } from '../components/kien-thuc-labels';
import { indexBreadcrumb } from '../kien-thuc-breadcrumb';
import {
  KIEN_THUC_NOT_FOUND_DESCRIPTION,
  KIEN_THUC_NOT_FOUND_TITLE,
} from '../kien-thuc-not-found-copy';
import { ENTRY_SHARE_IMAGE_TYPE, indexPath, shareImagePath } from '../kien-thuc-paths';
import type { FoundIndexPageData, IndexPageData } from '../route-data/index-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { definedTermSetJsonLd } from './kien-thuc-json-ld';

type MetaTag = SeoHead['meta'][number];

function termSetMeta(data: FoundIndexPageData): readonly MetaTag[] {
  if (data.kind !== ContentKind.ThuatNgu) {
    return [];
  }
  return [jsonLdMeta(definedTermSetJsonLd(data.groups.flatMap((group) => group.tiles)))];
}

export function indexHead(kind: EntryKind, data: IndexPageData | undefined): SeoHead {
  const path = indexPath(kind);
  if (data?.status !== KienThucPageStatus.Found) {
    return seo({
      title: KIEN_THUC_NOT_FOUND_TITLE,
      description: KIEN_THUC_NOT_FOUND_DESCRIPTION,
      path,
      noindex: true,
    });
  }
  const base = seo({
    title: KIND_INDEX_TITLE[kind],
    description: KIND_INDEX_DESCRIPTION[kind],
    path,
    image: shareImagePath(ENTRY_SHARE_IMAGE_TYPE[kind]),
  });
  return {
    ...base,
    meta: [...base.meta, jsonLdMeta(breadcrumbJsonLd(indexBreadcrumb(kind))), ...termSetMeta(data)],
  };
}
