import type { VanHanCurrent } from '@org/shared-contracts';
import type { ZodiacChi } from '@/lib/zodiac-icons';
import { seo } from '@/lib/seo';
import { vanHanZodiacPath } from './van-han-paths';
import { findVanHanEntry } from './van-han-view';

const SNIPPET_MAX_LENGTH = 160;
const ELLIPSIS = '…';
const WORD_SEPARATOR = ' ';
const PARAGRAPH_SEPARATOR = '\n';

export type VanHanZodiacHead = ReturnType<typeof seo>;

export function vanHanZodiacTitle(chi: ZodiacChi, current: VanHanCurrent | null): string {
  return findVanHanEntry(current, chi)?.title ?? `Vận hạn tuổi ${chi}`;
}

function searchSnippet(text: string): string {
  const opening = text.split(PARAGRAPH_SEPARATOR)[0].trim();
  if (opening.length <= SNIPPET_MAX_LENGTH) return opening;
  const cut = opening.slice(0, SNIPPET_MAX_LENGTH - ELLIPSIS.length);
  const lastWordEnd = cut.lastIndexOf(WORD_SEPARATOR);
  return `${lastWordEnd > 0 ? cut.slice(0, lastWordEnd) : cut}${ELLIPSIS}`;
}

function unpublishedDescription(chi: ZodiacChi): string {
  return `Vận hạn tuổi ${chi}: sao chiếu mệnh, hạn và luận giải cho từng năm sinh. Nội dung năm mới đang được cập nhật.`;
}

export function vanHanZodiacHead(chi: ZodiacChi, current: VanHanCurrent | null): VanHanZodiacHead {
  const entry = findVanHanEntry(current, chi);
  return seo({
    title: vanHanZodiacTitle(chi, current),
    description: entry ? searchSnippet(entry.luuNien) : unpublishedDescription(chi),
    path: vanHanZodiacPath(chi),
    type: 'article',
  });
}
