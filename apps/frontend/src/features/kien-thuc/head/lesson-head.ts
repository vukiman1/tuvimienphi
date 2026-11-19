import { breadcrumbJsonLd, jsonLdMeta, seo, type SeoHead } from '@/lib/seo';
import { lessonBreadcrumb } from '../kien-thuc-breadcrumb';
import {
  KIEN_THUC_NOT_FOUND_DESCRIPTION,
  KIEN_THUC_NOT_FOUND_TITLE,
} from '../kien-thuc-not-found-copy';
import { KienThucPageType, lessonPath, shareImagePath } from '../kien-thuc-paths';
import { KienThucPageStatus } from '../route-data/kien-thuc-page-status';
import type { LessonPageData } from '../route-data/lesson-route';
import { kienThucArticleJsonLd } from './kien-thuc-json-ld';

function notFoundHead(slug: string): SeoHead {
  return seo({
    title: KIEN_THUC_NOT_FOUND_TITLE,
    description: KIEN_THUC_NOT_FOUND_DESCRIPTION,
    path: lessonPath(slug),
    noindex: true,
  });
}

export function lessonHead(slug: string, data: LessonPageData | undefined): SeoHead {
  if (data?.status !== KienThucPageStatus.Found) {
    return notFoundHead(slug);
  }
  const { lesson } = data;
  const path = lessonPath(lesson.slug);
  const image = shareImagePath(KienThucPageType.Lesson);
  const base = seo({
    title: lesson.title,
    description: lesson.summary,
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
          headline: lesson.title,
          description: lesson.summary,
          path,
          reviewedAt: lesson.reviewedAt,
          image,
        }),
      ),
      jsonLdMeta(breadcrumbJsonLd(lessonBreadcrumb(lesson.slug, lesson.title))),
    ],
  };
}
