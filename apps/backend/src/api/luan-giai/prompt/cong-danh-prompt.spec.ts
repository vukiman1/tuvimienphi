import { CONG_DANH_SYSTEM_PROMPT } from './cong-danh-prompt';

describe('CONG_DANH_SYSTEM_PROMPT', () => {
  it('không còn tách riêng câu xướng tên sao khỏi câu kể ý ở đoạn 1', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).not.toContain(
      'Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển',
    );
  });

  it('vẫn yêu cầu mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh sinh ra nó', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).toContain(
      'Mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính',
    );
  });

  it('quy tắc gộp chung một cặp ** của phụ tinh không áp dụng cho chính tinh', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).toContain(
      'Quy tắc "gộp chung một cặp" ở mục 4 CHỈ áp dụng cho phụ tinh',
    );
  });

  it('có ví dụ sai khớp đúng lỗi hay gặp nhất: mỗi phụ tinh một cặp riêng dù cùng vai', () => {
    expect(CONG_DANH_SYSTEM_PROMPT).toContain(
      '**Thiên Khôi**, **Bát Tọa**, **Thiên Thọ** (mỗi sao một cặp riêng dù cùng vai — lỗi hay gặp nhất)',
    );
  });
});
