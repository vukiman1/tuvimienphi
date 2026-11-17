import { ContentKind } from '@org/shared-contracts';
import type { PlannedPage } from '@org/shared-kien-thuc';
import { FORBIDDEN_PHRASES } from '../../check-text';
import { SUMMARY_MAX_LENGTH, SUMMARY_MIN_LENGTH } from '../validate/check-shape';
import { ART_WRITTEN_AS_STAR, KIEN_THUC_FORBIDDEN } from '../validate/check-wording';

export interface WritingRule {
  readonly heading: string;
  readonly lines: readonly string[];
}

export const CALMER_PHRASINGS: readonly { readonly avoid: string; readonly write: string }[] = [
  { avoid: 'tai nạn', write: 'dễ va chạm, nên cẩn trọng khi đi lại' },
  { avoid: 'bệnh nặng', write: 'nên giữ gìn sức khỏe' },
  { avoid: 'Tử, Mộ, Tuyệt u ám', write: 'giai đoạn lắng xuống của vòng' },
];

export function writingGuideFor(page: PlannedPage): readonly WritingRule[] {
  const toneExtra =
    page.kind === ContentKind.Sao ? ['Nếu sao này là hung tinh, giữ cách nói nhẹ ở trên.'] : [];
  return [
    {
      heading: 'Người đọc',
      lines: [
        'Viết cho người mới, chưa biết gì; giải thích một thuật ngữ ngay lần đầu nó xuất hiện.',
      ],
    },
    {
      heading: 'Dữ kiện',
      lines: [
        'Chỉ viết từ các dữ kiện cho sẵn; không nêu bậc, hành, chòm hay quan hệ nào không có trong đó.',
        'Sao nào được ghi là không có bậc thì không nói miếu hay hãm; ô nào bảng bỏ trống thì không nhắc.',
        'Gọi vị trí chỉ bằng miếu, vượng, đắc địa, bình hòa, hãm, viết "tại" hoặc "ở" kèm chi.',
        'Chỉ gọi một sao là hung hay cát theo mẫu "<sao> là hung tinh / cát tinh".',
      ],
    },
    {
      heading: 'Tên và chính tả',
      lines: [
        'Viết "Tử Vi" cho sao, "tử vi" cho môn học.',
        `Không dùng các cách gọi môn học như tên sao: ${ART_WRITTEN_AS_STAR.join(', ')}.`,
        'Theo chính tả mới: Hóa, Hỏa, Thủy, Tị (không viết Tỵ).',
      ],
    },
    {
      heading: 'Liên kết',
      lines: [
        'Viết thuật ngữ dạng [[kind/slug|nhãn]], chỉ chọn trong danh sách đích.',
        'Nối tới bài sở hữu một khái niệm thay vì giải thích dài; mỗi đích chỉ nối một lần.',
      ],
    },
    {
      heading: 'Giọng văn',
      lines: [
        'Không doạ dẫm, không hứa hẹn, không bán hàng, không nói về cách bài được viết.',
        `Không dùng các cụm: ${[...FORBIDDEN_PHRASES, ...KIEN_THUC_FORBIDDEN].join(', ')}.`,
        ...CALMER_PHRASINGS.map((phrasing) => `Thay "${phrasing.avoid}" bằng "${phrasing.write}".`),
        ...toneExtra,
      ],
    },
    {
      heading: 'Tóm tắt',
      lines: [
        `Một đến hai câu, ${SUMMARY_MIN_LENGTH}–${SUMMARY_MAX_LENGTH} ký tự, cho kết quả tìm kiếm và popover, không có liên kết.`,
      ],
    },
  ];
}
