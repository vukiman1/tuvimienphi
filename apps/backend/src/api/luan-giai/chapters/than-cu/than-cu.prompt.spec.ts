import { THAN_CU_SYSTEM_PROMPT } from './than-cu.prompt';

describe('THAN_CU_SYSTEM_PROMPT', () => {
  it('không còn tách riêng câu xướng tên sao khỏi câu kể ý ở đoạn 1', () => {
    expect(THAN_CU_SYSTEM_PROMPT).not.toContain(
      'Câu 1 dẫn tên chính tinh kèm bậc. Câu 2 khai triển',
    );
  });

  it('vẫn yêu cầu mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh sinh ra nó', () => {
    expect(THAN_CU_SYSTEM_PROMPT).toContain(
      'Mỗi câu dẫn đúng một mệnh đề cùng tên và bậc của chính tinh',
    );
  });
});
