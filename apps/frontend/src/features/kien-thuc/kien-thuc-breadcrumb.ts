import type { BreadcrumbItem } from '@/lib/seo';
import { KIEN_THUC_PATH, lessonPath } from './kien-thuc-paths';

const KIEN_THUC_CRUMB: BreadcrumbItem = { name: 'Kiến thức', path: KIEN_THUC_PATH };

export function lessonBreadcrumb(slug: string, title: string): readonly BreadcrumbItem[] {
  return [KIEN_THUC_CRUMB, { name: title, path: lessonPath(slug) }];
}
