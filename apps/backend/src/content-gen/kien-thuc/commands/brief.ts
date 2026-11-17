import { plannedPage, plannedRefOf } from '@org/shared-kien-thuc';
import { buildPageBrief } from '../brief/build-page-brief';
import { renderBrief } from '../brief/render-brief';
import { pagesOfBatch } from '../batches';
import type { BriefTarget } from '../cli-options';
import { UnknownPageRefError } from '../errors';

export function briefOutput(target: BriefTarget): string {
  if ('ref' in target) {
    const page = plannedPage(target.ref);
    if (page === undefined) throw new UnknownPageRefError(target.ref);
    return renderBrief(buildPageBrief(page));
  }
  return pagesOfBatch(target.batch)
    .map((page) => plannedRefOf(page))
    .join('\n');
}
