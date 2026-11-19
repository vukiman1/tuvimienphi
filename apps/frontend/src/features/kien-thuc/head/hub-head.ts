import { KIEN_THUC_STEPS } from '@org/shared-kien-thuc';
import { seo, type SeoHead } from '@/lib/seo';
import { KIEN_THUC_PATH, KienThucPageType, shareImagePath } from '../kien-thuc-paths';

const HUB_TITLE = `Học tử vi từ đầu: lộ trình ${KIEN_THUC_STEPS.length} bước và tra cứu sao, cung`;
const HUB_DESCRIPTION = `Học đọc lá số tử vi qua ${KIEN_THUC_STEPS.length} bước ngắn, đọc theo thứ tự, rồi tra từng sao, từng cung và thuật ngữ. Miễn phí, không cần đăng nhập.`;

export function hubHead(): SeoHead {
  return seo({
    title: HUB_TITLE,
    description: HUB_DESCRIPTION,
    path: KIEN_THUC_PATH,
    image: shareImagePath(KienThucPageType.Hub),
  });
}
