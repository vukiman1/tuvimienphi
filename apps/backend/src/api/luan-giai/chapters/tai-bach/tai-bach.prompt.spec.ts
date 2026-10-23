import { TAI_BACH_SYSTEM_PROMPT } from './tai-bach.prompt';

describe('TAI_BACH_SYSTEM_PROMPT', () => {
  it('yêu cầu mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh sinh ra nó', () => {
    expect(TAI_BACH_SYSTEM_PROMPT).toContain(
      'Mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh',
    );
  });

  it('nói rõ bài luận đọc cung Tài Bạch và viết về cách kiếm/giữ tiền, không lấn sang công việc hay tình cảm', () => {
    expect(TAI_BACH_SYSTEM_PROMPT).toContain('Bài luận CUNG TÀI BẠCH');
    expect(TAI_BACH_SYSTEM_PROMPT).toContain('CÁCH KIẾM TIỀN VÀ GIỮ TIỀN');
  });

  it('quy tắc gộp chung một cặp ** của phụ tinh không áp dụng cho chính tinh', () => {
    expect(TAI_BACH_SYSTEM_PROMPT).toContain(
      'Quy tắc "gộp chung một cặp" ở mục 4 CHỈ áp dụng cho phụ tinh',
    );
  });

  it('có ví dụ sai khớp đúng lỗi hay gặp nhất: mỗi phụ tinh một cặp riêng dù cùng vai', () => {
    expect(TAI_BACH_SYSTEM_PROMPT).toContain(
      '**Thiên Khôi**, **Bát Tọa**, **Thiên Thọ** (mỗi sao một cặp riêng dù cùng vai — lỗi hay gặp nhất)',
    );
  });
});
