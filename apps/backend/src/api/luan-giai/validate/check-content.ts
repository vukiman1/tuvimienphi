import type { ChapterBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';

export function checkContent(brief: ChapterBrief, bai: BaiCanKiem): string[] {
  const thuong = bai.doan.map((doan) => doan.toLowerCase());

  return brief.luan.flatMap((menhDe) => {
    const dich = thuong[bai.doanCuaSac[menhDe.sac]] ?? '';
    const co = menhDe.tuKhoa.some((tu) => dich.includes(tu.toLowerCase()));
    if (co) return [];
    return [
      `mệnh đề [${menhDe.sac}] "${menhDe.y}" không xuất hiện — cần một trong ${JSON.stringify(menhDe.tuKhoa)}`,
    ];
  });
}
