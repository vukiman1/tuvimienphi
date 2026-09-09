import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';

/**
 * Thuật ngữ chỉ đúng khi sao toạ thủ tại cung Mệnh. Chương này viết cho sáu cung an Thân, nên dùng
 * chúng cho năm cung còn lại là sai — mà đọc lên vẫn trôi, không ai nhận ra.
 */
const CHI_DUNG_O_CUNG_MENH = ['thủ mệnh', 'chiếu mệnh', 'toạ mệnh', 'tọa mệnh'] as const;

/** Hứa hẹn không có trong brief. Tầng kiểm nội dung chỉ bắt mệnh đề thiếu, không bắt mệnh đề bịa. */
const HUA_HEN_VO_CAN_CU = [
  'vượt qua mọi',
  'mọi thử thách',
  'chắc chắn sẽ',
  'không bao giờ',
  'luôn luôn',
] as const;

/** Lối văn hành chính. Prompt đã cấm từ đầu nhưng mô hình vẫn dùng khi không có ai gác. */
const VAN_HANH_CHINH = [
  'bước vào cung',
  'sự hiện diện của',
  'sự hội tụ của',
  'khi xét qua',
] as const;

/**
 * Tầng bốn: cụm từ bị cấm.
 *
 * Sinh ra từ một quan sát lặp lại ba lần trong lúc dựng — luật nào chỉ nằm trong prompt mà không có
 * tầng kiểm nào gác thì mô hình bỏ qua.
 */
export function checkForbiddenPhrases(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  const cam = [
    ...(brief.cungThan === 'Mệnh' ? [] : CHI_DUNG_O_CUNG_MENH),
    ...HUA_HEN_VO_CAN_CU,
    ...VAN_HANH_CHINH,
  ];

  return [paragraphs.doan1, paragraphs.doan2].flatMap((doan, chiSo) => {
    const thuong = doan.toLowerCase();
    return cam
      .filter((cum) => thuong.includes(cum))
      .map((cum) => `đoạn ${chiSo + 1}: dùng cụm bị cấm "${cum}"`);
  });
}
