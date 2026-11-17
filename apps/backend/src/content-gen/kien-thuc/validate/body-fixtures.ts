import type { ContentSection } from '@org/shared-contracts';
import type { PageDraftBody } from './check-shape';

const FILLER_WORDS = ['sao', 'cung', 'mệnh', 'hành', 'vận', 'số', 'cát', 'hung', 'bậc', 'cục'];

export const VALID_SUMMARY = 'Bài học mở đầu giúp người mới làm quen với lá số và cách đọc cơ bản.';

export function syllableRun(count: number): string {
  return Array.from({ length: count }, (_, i) => FILLER_WORDS[i % FILLER_WORDS.length]).join(' ');
}

export function sectionOf(heading: string, paragraphs: readonly string[]): ContentSection {
  return { heading, paragraphs };
}

export function validLessonBody(): PageDraftBody {
  return {
    summary: VALID_SUMMARY,
    sections: [
      sectionOf('Mở đầu', [
        `Xem [[bai/tu-vi-la-gi|bài]] rồi [[sao/thien-co|sao]] và [[cung/menh|cung]]. ${syllableRun(100)}`,
        syllableRun(100),
      ]),
      sectionOf('Thân bài một', [syllableRun(120), syllableRun(120)]),
      sectionOf('Thân bài hai', [syllableRun(120), syllableRun(120)]),
    ],
  };
}

export function validEntryBody(): PageDraftBody {
  return {
    summary: VALID_SUMMARY,
    sections: [
      sectionOf('Giới thiệu', [
        `Xem [[sao/thien-co|sao]] và [[cung/menh|cung]]. ${syllableRun(130)}`,
      ]),
      sectionOf('Chi tiết', [syllableRun(130)]),
      sectionOf('Kết luận', [syllableRun(125)]),
    ],
  };
}
