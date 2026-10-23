import type { ChapterBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';
import { sentences } from './parse-markup';

export function checkAttribution(brief: ChapterBrief, bai: BaiCanKiem): string[] {
  const cau = bai.doan.flatMap((doan) => sentences(doan)).map((mot) => mot.toLowerCase());

  return brief.luan.flatMap((menhDe) => {
    if (menhDe.do.length === 0) return [];

    const cauCoTuKhoa = cau.filter((mot) =>
      menhDe.tuKhoa.some((tu) => mot.includes(tu.toLowerCase())),
    );
    if (cauCoTuKhoa.length === 0) return [];

    const dungSao = cauCoTuKhoa.some((mot) =>
      menhDe.do.some((sao) => mot.includes(sao.toLowerCase())),
    );
    if (dungSao) return [];

    return [`quy kết sai: "${menhDe.y}" không nằm cùng câu với ${JSON.stringify(menhDe.do)}`];
  });
}
