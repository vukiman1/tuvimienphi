import { CAN, CHI, type Rating, type SaoName } from '@org/shared-tu-vi';
import { saoFacts, SaoKind } from '@org/shared-kien-thuc';

const CANH_CAN = 6;
const RATING_ORDER: readonly Rating[] = ['M', 'V', 'Đ', 'B', 'H'];
const RATING_WORD: Readonly<Record<Rating, string>> = {
  M: 'miếu',
  V: 'vượng',
  Đ: 'đắc địa',
  B: 'bình hòa',
  H: 'hãm',
};
const FULL_ROW = 12;

function chiName(chi: number): string {
  return CHI[chi];
}

export function saoRequiredMentions(star: SaoName): readonly string[] {
  const facts = saoFacts(star);
  const mentions = [star, `hành ${facts.hanh}`];
  if (facts.kind === SaoKind.ChinhTinh) mentions.push(`chòm ${facts.chom}`);
  return mentions;
}

export function saoBriefLines(star: SaoName): readonly string[] {
  const facts = saoFacts(star);
  const lines = [`Hành: ${facts.hanh}.`];
  if (facts.kind === SaoKind.ChinhTinh) {
    lines.push(`Chòm: chòm ${facts.chom}.`);
  } else {
    lines.push(`Tính chất: ${facts.isHung ? 'hung tinh' : 'cát tinh'}.`);
  }
  if (facts.ratings.length === 0) {
    lines.push('Sao này không có bảng bậc ở đây; không nêu miếu hay hãm.');
  } else {
    for (const rating of RATING_ORDER) {
      const chis = facts.ratings
        .filter((cell) => cell.rating === rating)
        .map((cell) => chiName(cell.chi));
      if (chis.length > 0) lines.push(`${RATING_WORD[rating]} ở ${chis.join(', ')}.`);
    }
    if (facts.ratings.length < FULL_ROW) {
      const cells = facts.ratings.map((cell) => chiName(cell.chi)).join(', ');
      lines.push(
        `Bảng ở đây chỉ ghi bậc tại ${cells}; không nêu bậc ở cung khác, không suy từ sao cặp.`,
      );
    }
  }
  if (facts.kind === SaoKind.TuHoa) {
    for (const row of facts.byCan) {
      lines.push(`Năm ${CAN[row.can]}: ${facts.name} là ${row.star}.`);
    }
    lines.push(`Hàng ${CAN[CANH_CAN]} khác nhau giữa các trường phái; theo bảng của engine.`);
  }
  return lines;
}
