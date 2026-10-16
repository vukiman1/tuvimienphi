import { cungSystemPrompt } from './cung-prompt';

const PROMPT = cungSystemPrompt({
  cung: 'Phu Thê',
  vietVe: 'VIẾT VỀ THỬ',
  khongVietVe: 'chuyện khác',
  khiVoChinhDieu: 'nết thử',
});

describe('cungSystemPrompt', () => {
  it('gọi đúng tên cung ở luật E, F, G', () => {
    expect(PROMPT).toContain('Bài luận CUNG PHU THÊ');
    expect(PROMPT).toContain('cung Phu Thê KHÔNG có chính tinh nào toạ thủ, nết thử khi ấy');
    expect(PROMPT).toContain('đóng tại cung Phu Thê');
  });

  it('nêu chủ đề được viết và chủ đề phải tránh', () => {
    expect(PROMPT).toContain('Viết về VIẾT VỀ THỬ, không viết về chuyện khác cụ thể.');
  });
});
