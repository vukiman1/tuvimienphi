import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { sentences } from './parse-markup';

/**
 * Tầng ba: mệnh đề phải nằm cùng câu với sao sinh ra nó.
 *
 * Tầng hai chỉ hỏi mệnh đề có mặt hay không, nên mô hình vẫn nén được hai mệnh đề vào một vế rồi
 * gán cả hai cho một sao. Đo được lúc dựng: "đào hoa nên tình duyên dễ nhiều mối" vốn của Tham Lang
 * bị viết thành của Đà La, hai tầng trên đều cho qua.
 */
export function checkAttribution(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  const cau = [...sentences(paragraphs.doan1), ...sentences(paragraphs.doan2)].map((mot) =>
    mot.toLowerCase(),
  );

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
