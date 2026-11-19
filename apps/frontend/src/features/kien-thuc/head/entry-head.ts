import { ContentKind } from '@org/shared-contracts';
import type { EntryFile, EntryKind } from '@org/shared-contracts';
import { breadcrumbJsonLd, jsonLdMeta, seo, type SeoHead } from '@/lib/seo';
import { entryBreadcrumb } from '../kien-thuc-breadcrumb';
import {
  KIEN_THUC_NOT_FOUND_DESCRIPTION,
  KIEN_THUC_NOT_FOUND_TITLE,
} from '../kien-thuc-not-found-copy';
import { KienThucPageType, entryPath, shareImagePath } from '../kien-thuc-paths';
import type { EntryPageData } from '../route-data/entry-route';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import { definedTermJsonLd, kienThucArticleJsonLd } from './kien-thuc-json-ld';

const SHARE_IMAGE_TYPE: Readonly<Record<EntryKind, KienThucPageType>> = {
  [ContentKind.Sao]: KienThucPageType.Star,
  [ContentKind.Cung]: KienThucPageType.Palace,
  [ContentKind.ThuatNgu]: KienThucPageType.Term,
};

type MetaTag = SeoHead['meta'][number];

function notFoundHead(kind: EntryKind, slug: string): SeoHead {
  return seo({
    title: KIEN_THUC_NOT_FOUND_TITLE,
    description: KIEN_THUC_NOT_FOUND_DESCRIPTION,
    path: entryPath(kind, slug),
    noindex: true,
  });
}

function termMeta(entry: EntryFile, path: string): readonly MetaTag[] {
  if (entry.kind !== ContentKind.ThuatNgu) {
    return [];
  }
  return [jsonLdMeta(definedTermJsonLd({ name: entry.title, description: entry.summary, path }))];
}

export function entryHead(kind: EntryKind, slug: string, data: EntryPageData | undefined): SeoHead {
  if (data?.status !== KienThucPageStatus.Found) {
    return notFoundHead(kind, slug);
  }
  const { entry } = data;
  const path = entryPath(entry.kind, entry.slug);
  const image = shareImagePath(SHARE_IMAGE_TYPE[entry.kind]);
  const base = seo({
    title: entry.title,
    description: entry.summary,
    path,
    image,
    type: 'article',
  });
  return {
    ...base,
    meta: [
      ...base.meta,
      jsonLdMeta(
        kienThucArticleJsonLd({
          headline: entry.title,
          description: entry.summary,
          path,
          reviewedAt: entry.reviewedAt,
          image,
        }),
      ),
      jsonLdMeta(breadcrumbJsonLd(entryBreadcrumb(entry))),
      ...termMeta(entry, path),
    ],
  };
}
