import type { PageRef } from '@org/shared-contracts';
import { plannedPage } from '@org/shared-kien-thuc';
import { scanLinks } from '../text/link-markup';
import type { PageDraftBody, PageLimits } from './check-shape';

export function checkLinks(
  body: PageDraftBody,
  self: PageRef,
  limits: PageLimits,
): readonly string[] {
  const violations: string[] = [];
  const targets = new Set<PageRef>();
  for (const section of body.sections) {
    for (const paragraph of section.paragraphs) {
      const scan = scanLinks(paragraph);
      for (const malformed of scan.malformed) {
        violations.push(`liên kết hỏng "${malformed}"`);
      }
      for (const link of scan.links) {
        if (link.ref === self) {
          violations.push(`liên kết trỏ về chính trang "${self}"`);
          continue;
        }
        if (plannedPage(link.ref) === undefined) {
          violations.push(`liên kết tới "${link.ref}" không có trong danh mục`);
          continue;
        }
        targets.add(link.ref);
      }
    }
  }
  if (targets.size < limits.minLinkTargets) {
    violations.push(`có ${targets.size} liên kết khác nhau, cần ít nhất ${limits.minLinkTargets}`);
  }
  return violations;
}
