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
  });

  it('ví dụ tên hoá viết "Hoá" đúng như mệnh đề hoá trong brief', () => {
    const prompt = mucSystemPrompt('Mệnh');

    expect(prompt).toContain('"Hoá Kỵ", "Hoá Quyền"');
    expect(prompt).not.toContain('"Hóa Kỵ", "Hóa Quyền"');
  });

  it('hoá đã có trong catTinh hoặc hungTinh thì viết như phụ tinh', () => {
    expect(mucSystemPrompt('Mệnh')).toContain(
      'Riêng hoá nào đã có tên trong catTinh hoặc hungTinh thì là phụ tinh: viết theo mục 4.',
    );
  });
});
