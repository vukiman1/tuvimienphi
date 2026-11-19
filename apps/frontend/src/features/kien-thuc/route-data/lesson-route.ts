import { isReservedLessonSlug } from '@org/shared-contracts';
import type { KienThucManifest, LessonFile } from '@org/shared-contracts';
import type { KienThucContentSource } from '../content-source';
import { publishedLesson } from '../published-pages';
import { KienThucPageStatus } from './kien-thuc-page-status';

export type LessonPageData =
  | {
      readonly status: KienThucPageStatus.Found;
      readonly lesson: LessonFile;
      readonly manifest: KienThucManifest;
    }
  | { readonly status: KienThucPageStatus.NotFound };

const NOT_FOUND: LessonPageData = { status: KienThucPageStatus.NotFound };

export async function loadLessonPage(
  slug: string,
  source: KienThucContentSource,
): Promise<LessonPageData> {
  if (isReservedLessonSlug(slug)) {
    return NOT_FOUND;
  }
  const manifest = source.loadManifest();
  if (!publishedLesson(manifest, slug)) {
    return NOT_FOUND;
  }
  const lesson = await source.loadLesson(slug);
  return lesson ? { status: KienThucPageStatus.Found, lesson, manifest } : NOT_FOUND;
}
