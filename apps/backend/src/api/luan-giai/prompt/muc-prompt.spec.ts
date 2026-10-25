import { mucSystemPrompt } from './muc-prompt';

describe('mucSystemPrompt', () => {
  it('cấm gọi thủ mệnh khi mục đọc một cung khác Mệnh', () => {
    const prompt = mucSystemPrompt('Phu Thê');

    expect(prompt).toContain('cung Phu Thê');
    expect(prompt).toContain('đừng viết "thủ mệnh"');
  });

  it('cho phép gọi thủ mệnh khi mục đọc chính cung Mệnh', () => {
    const prompt = mucSystemPrompt('Mệnh');

    expect(prompt).not.toContain('đừng viết "thủ mệnh"');
  });

  it('có quy tắc riêng cho mệnh đề không gắn sao (cách cục, hoá, án ngữ)', () => {
    const prompt = mucSystemPrompt('Mệnh');

    expect(prompt).toContain('không có sao sinh ra nó');
    expect(prompt).toContain('giữ nguyên chữ hoa đúng như trong brief');
    expect(prompt).not.toContain('bằng chữ thường');
  });
});
