import { ContentKind } from '@org/shared-contracts';
import type { SaoName } from '@org/shared-tu-vi';
import { checkCatHung } from './check-cat-hung';
import { checkChom } from './check-chom';
import { checkHanh } from './check-hanh';
import { checkRatings } from './check-ratings';
import { checkRelations } from './check-relations';
import { checkTuHoaByCan } from './check-tu-hoa-by-can';
import type { FactCheck, FactSubject } from './fact-subject';

function sao(star: SaoName): FactSubject {
  return { kind: ContentKind.Sao, star };
}

const CHECKS: readonly FactCheck[] = [
  checkRatings,
  checkHanh,
  checkChom,
  checkCatHung,
  checkRelations,
  checkTuHoaByCan,
];

const GOLDEN: readonly { readonly subject: FactSubject; readonly sentence: string }[] = [
  { subject: null, sentence: 'Thiên Cơ miếu ở Thìn, Tuất, Mão, Dậu và hãm ở Dần, Hợi.' },
  { subject: null, sentence: 'Thiên Cơ hãm ở Dần nhưng sang Thìn lại miếu.' },
  { subject: sao('Thiên Cơ'), sentence: 'Sao này hãm tại Dần, Hợi, còn tới Tị, Thân thì vượng.' },
  { subject: sao('Thiên Cơ'), sentence: 'Tại Dần và Hợi, sao này hãm.' },
  { subject: null, sentence: 'Người sinh năm Thân có Thiên Cơ ở Mệnh thường miếu vượng.' },
  { subject: sao('Thiên Cơ'), sentence: 'Đi cùng Cự Môn ở Mão, sao này miếu địa.' },
  { subject: sao('Tả Phù'), sentence: 'Tả Phù không có bậc miếu hay hãm.' },
  { subject: sao('Tả Phù'), sentence: 'Tả Phù không mang bậc miếu, vượng hay hãm như chính tinh.' },
  {
    subject: sao('Tả Phù'),
    sentence: 'Không như Thiên Cơ có lúc miếu lúc hãm, Tả Phù không có bậc.',
  },
  { subject: null, sentence: 'Lá số có Thân cư Mệnh, Thái Dương miếu thì càng sáng.' },
  { subject: sao('Địa Kiếp'), sentence: 'Không Kiếp đắc địa ở Dần, Thân, Tị, Hợi.' },
  { subject: sao('Lộc Tồn'), sentence: 'Gặp Lộc Tồn, hung tinh bớt phần nào sức phá.' },
  {
    subject: sao('Thiên Khôi'),
    sentence: 'Thiên Khôi đi cùng hung tinh vẫn giữ được vai quý nhân.',
  },
  { subject: null, sentence: 'Cung Phúc Đức gặp hung tinh thì nên đọc kỹ các sao đi kèm.' },
  { subject: sao('Kình Dương'), sentence: 'Kình Dương là hung tinh.' },
  { subject: sao('Văn Xương'), sentence: 'Văn Xương là cát tinh, chủ về chữ nghĩa.' },
  {
    subject: null,
    sentence: 'Bốn nhóm tam hợp là Thân Tý Thìn, Dần Ngọ Tuất, Tị Dậu Sửu và Hợi Mão Mùi.',
  },
  { subject: null, sentence: 'Mệnh tam hợp với Tài Bạch và Quan Lộc.' },
  {
    subject: null,
    sentence:
      'Mệnh, Tài Bạch, Quan Lộc là một bộ tam hợp, còn Phụ Mẫu, Tật Ách, Tử Tức là bộ khác.',
  },
  { subject: null, sentence: 'Năm Đinh, Hóa Lộc ở Thái Âm, Hóa Quyền ở Thiên Đồng.' },
  { subject: sao('Địa Không'), sentence: 'Địa Không đắc địa ở Dần, Tị, Thân, Hợi và hãm ở Tý.' },
  { subject: sao('Thiên Cơ'), sentence: 'Sao đi cùng thuộc chòm Thiên Phủ.' },
];

describe('golden sentences', () => {
  it.each(GOLDEN)('passes every fact check for "$sentence"', ({ subject, sentence }) => {
    for (const check of CHECKS) {
      expect(check(sentence, subject).violations).toEqual([]);
    }
  });
});
