import { THAN_CU_SYSTEM_PROMPT } from './than-cu.prompt';

describe('THAN_CU_SYSTEM_PROMPT', () => {
  it('không còn tách riêng câu xướng tên sao khỏi câu kể ý ở đoạn 1', () => {
    expect(THAN_CU_SYSTEM_PROMPT).not.toContain(
      'Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển',
    );
  });

  it('yêu cầu mỗi câu dẫn đúng một mệnh đề cùng tên sao sinh ra nó', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain('Mỗi câu dẫn đúng một mệnh đề cùng tên sao sinh ra nó');
  });

  it('chỉ đòi kèm bậc khi sao sinh ra mệnh đề là chính tinh', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain('chính tinh thì kèm bậc, phụ tinh thì không');
    expect(THAN_CU_SYSTEM_PROMPT).not.toContain('cùng tên và bậc của chính tinh');
  });

  it('nói rõ hoá là phụ tinh nên không kèm bậc dù đi theo chính tinh có bậc', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain(
      'Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ là phụ tinh: không kèm',
    );
  });

  it('quy tắc gộp chung một cặp ** của phụ tinh không áp dụng cho chính tinh', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain(
      'Quy tắc "gộp chung một cặp" ở mục 4 CHỈ áp dụng cho phụ tinh',
    );
  });

  it('có ví dụ sai khớp đúng lỗi hay gặp nhất: mỗi phụ tinh một cặp riêng dù cùng vai', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain(
      '**Thiên Khôi**, **Bát Tọa**, **Thiên Thọ** (mỗi sao một cặp riêng dù cùng vai — lỗi hay gặp nhất)',
    );
  });
});
