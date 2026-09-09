import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';

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

function tim(bai: BaiCanKiem, cam: readonly string[]): string[] {
  return bai.doan.flatMap((doan, chiSo) => {
    const thuong = doan.toLowerCase();
    return cam
      .filter((cum) => thuong.includes(cum))
      .map((cum) => `đoạn ${chiSo + 1}: dùng cụm bị cấm "${cum}"`);
  });
}

/**
 * Tầng bốn, phần BẮT BUỘC: cụm SAI chứ không phải cụm xấu. Sai thuật ngữ tử vi và hứa hẹn không có
 * trong brief — hai thứ đó lọt ra ngoài là bài nói sai, nên chặn tới cùng.
 *
 * Sinh ra từ một quan sát lặp lại bốn lần trong lúc dựng: luật nào chỉ nằm trong prompt mà không có
 * tầng kiểm nào gác thì mô hình bỏ qua.
 */
export function checkForbiddenPhrases(brief: ThanCuBrief, bai: BaiCanKiem): string[] {
  return tim(bai, [
    ...(brief.cungThan === 'Mệnh' ? [] : CHI_DUNG_O_CUNG_MENH),
    ...HUA_HEN_VO_CAN_CU,
  ]);
}

/**
 * Phần NÊN TRÁNH: lối văn hành chính. Đáng sinh lại để bài đọc xuôi hơn, nhưng không đáng để người
 * dùng nhận 503 — đo trên hai mươi lá số thì đúng chuyện đó đã xảy ra với hai bài.
 */
export function checkStyle(bai: BaiCanKiem): string[] {
  return tim(bai, VAN_HANH_CHINH);
}
