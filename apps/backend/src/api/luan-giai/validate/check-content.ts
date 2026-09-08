import { Sac, type ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';

/**
 * Tầng hai: mọi mệnh đề trong brief phải thực sự có mặt trong bài.
 *
 * Không có tầng này thì mô hình làm nhạt mệnh đề bất lợi cho dễ đọc — đo được lúc dựng: ba mệnh đề
 * "hao tán, tiêu tốn tiền bạc", "chịu áp lực hoặc mất mát", "vướng chuyện ngoài luồng" bị viết gộp
 * thành "cần thêm sự khéo léo", mà tầng kiểm hình thức không thấy gì sai.
 */
export function checkContent(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  const doanCua: Record<Sac, string> = {
    [Sac.Thuan]: paragraphs.doan1.toLowerCase(),
    [Sac.Nghich]: paragraphs.doan2.toLowerCase(),
    [Sac.HoaGiai]: paragraphs.doan2.toLowerCase(),
  };

  return brief.luan.flatMap((menhDe) => {
    const co = menhDe.tuKhoa.some((tu) => doanCua[menhDe.sac].includes(tu.toLowerCase()));
    if (co) return [];
    return [
      `mệnh đề [${menhDe.sac}] "${menhDe.y}" không xuất hiện — cần một trong ${JSON.stringify(menhDe.tuKhoa)}`,
    ];
  });
}
