import type { ThanCuBrief } from '@org/shared-tu-vi';
import type { ThanCuParagraphs } from '../prompt/chapter-schema';
import { boldGroups, countSentences, highlights, ratingOf, stripRating } from './parse-markup';

const SENTENCES_PER_PARAGRAPH = 2;
const HIGHLIGHTS_PER_PARAGRAPH = 1;
const MAX_HIGHLIGHT_WORDS = 12;

/**
 * Tầng một: hình thức và tên sao. Bắt được lỗi nguy hiểm nhất — mô hình gọi tên một sao có thật,
 * hợp cảnh, đúng vai trò trong câu, nhưng không có trong lá số. Đọc không ai phát hiện ra.
 */
export function checkForm(brief: ThanCuBrief, paragraphs: ThanCuParagraphs): string[] {
  const hopLe = new Set<string>([
    ...brief.chinhTinh.map((sao) => sao.ten),
    ...brief.hungTinh.map((sao) => sao.ten),
    ...brief.catTinh.map((sao) => sao.ten),
  ]);
  const bacCua = new Map(brief.chinhTinh.map((sao) => [sao.ten as string, sao.bac]));
  const laHung = new Set<string>(brief.hungTinh.map((sao) => sao.ten));

  return [paragraphs.doan1, paragraphs.doan2].flatMap((doan, chiSo) =>
    kiemMotDoan(doan, chiSo + 1, hopLe, bacCua, laHung),
  );
}

function kiemMotDoan(
  doan: string,
  thuTu: number,
  hopLe: ReadonlySet<string>,
  bacCua: ReadonlyMap<string, string | null>,
  laHung: ReadonlySet<string>,
): string[] {
  const loi: string[] = [];
  const soCau = countSentences(doan);
  if (soCau !== SENTENCES_PER_PARAGRAPH) {
    loi.push(`đoạn ${thuTu}: ${soCau} câu, cần đúng ${SENTENCES_PER_PARAGRAPH}`);
  }

  const toNen = highlights(doan);
  if (toNen.length !== HIGHLIGHTS_PER_PARAGRAPH) {
    loi.push(`đoạn ${thuTu}: ${toNen.length} cụm ==...==, cần đúng ${HIGHLIGHTS_PER_PARAGRAPH}`);
  }
  for (const cum of toNen) {
    const soChu = cum.split(/\s+/).length;
    if (soChu > MAX_HIGHLIGHT_WORDS) {
      loi.push(`đoạn ${thuTu}: cụm ==${cum}== dài ${soChu} chữ, tối đa ${MAX_HIGHLIGHT_WORDS}`);
    }
  }

  const nhomPhuTinh: string[][] = [];
  for (const nhom of boldGroups(doan)) {
    // Lồng ==...== vào trong **...** thì phần bên trong bị bóc ra như một tên sao, kéo theo hai
    // thông báo sai chỗ — "không có trong brief" và "tách thành 2 cặp". Bắt riêng và nói thẳng,
    // vì mô hình đọc hai thông báo kia xong không biết đường nào mà sửa.
    if (nhom.some((token) => token.includes('='))) {
      loi.push(`đoạn ${thuTu}: không được lồng ==...== vào trong **...**, hai dấu phải tách rời`);
      continue;
    }
    const coChinhTinh = nhom.some((token) => bacCua.has(stripRating(token)));
    if (coChinhTinh && nhom.length > 1) {
      loi.push(`đoạn ${thuTu}: chính tinh bị gói chung — "${nhom.join(', ')}"`);
    }
    if (!coChinhTinh) nhomPhuTinh.push(nhom);

    for (const token of nhom) {
      const ten = stripRating(token);
      const bac = ratingOf(token);
      if (!hopLe.has(ten)) {
        loi.push(`đoạn ${thuTu}: "${ten}" không có trong brief`);
        continue;
      }
      const bacDung = bacCua.get(ten);
      if (bacCua.has(ten) && bac === null) {
        loi.push(`đoạn ${thuTu}: chính tinh "${ten}" thiếu bậc`);
      } else if (bacCua.has(ten) && bac !== bacDung) {
        loi.push(`đoạn ${thuTu}: "${token}" sai bậc, đúng là (${bacDung})`);
      } else if (!bacCua.has(ten) && bac !== null) {
        loi.push(`đoạn ${thuTu}: phụ tinh "${token}" không được kèm bậc`);
      }
    }
  }

  // Gói theo vai chứ không gói tất cả vào một cặp: bài mẫu để hung tinh ở câu một, cát tinh ở câu hai.
  const soNhomHung = nhomPhuTinh.filter((nhom) => nhom.some((ten) => laHung.has(ten))).length;
  const soNhomCat = nhomPhuTinh.filter((nhom) => nhom.every((ten) => !laHung.has(ten))).length;
  if (soNhomHung > 1) loi.push(`đoạn ${thuTu}: hung tinh tách thành ${soNhomHung} cặp **`);
  if (soNhomCat > 1) loi.push(`đoạn ${thuTu}: cát tinh tách thành ${soNhomCat} cặp **`);
  for (const nhom of nhomPhuTinh) {
    if (nhom.some((ten) => laHung.has(ten)) && nhom.some((ten) => !laHung.has(ten))) {
      loi.push(
        `đoạn ${thuTu}: trộn hung tinh với cát tinh trong cùng một cặp ** — "${nhom.join(', ')}"`,
      );
    }
  }

  return loi;
}
