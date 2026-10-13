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
});
