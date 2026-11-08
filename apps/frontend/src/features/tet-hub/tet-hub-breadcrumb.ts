import type { BreadcrumbItem } from './breadcrumb-item';
import { KIEN_THUC_PATH, TET_HUB_PATH, TET_HUB_TITLE } from './tet-hub-paths';

export const TET_HUB_BREADCRUMB: readonly BreadcrumbItem[] = [
  { name: 'Kiến thức', path: KIEN_THUC_PATH },
  { name: TET_HUB_TITLE, path: TET_HUB_PATH },
];
