import { GiaDaoMucKey } from '@org/shared-tu-vi';
import { GIA_DAO_SYSTEM_PROMPT, TINH_DUYEN_SYSTEM_PROMPT } from './tinh-duyen.prompt';

describe('TINH_DUYEN_SYSTEM_PROMPT', () => {
  it('nói rõ bài luận đọc cung Phu Thê', () => {
    expect(TINH_DUYEN_SYSTEM_PROMPT).toContain('Bài luận CUNG PHU THÊ');
  });

  it('dặn không gọi người bạn đời là vợ hay chồng', () => {
    expect(TINH_DUYEN_SYSTEM_PROMPT).toContain('không dùng "vợ", "chồng"');
  });
});

describe('GIA_DAO_SYSTEM_PROMPT', () => {
  it('mục con cái đọc cung Tử Tức và không lấn sang người bạn đời hay cha mẹ', () => {
    const prompt = GIA_DAO_SYSTEM_PROMPT[GiaDaoMucKey.ConCai];

    expect(prompt).toContain('Bài luận CUNG TỬ TỨC');
    expect(prompt).toContain('không viết về người bạn đời, cha mẹ');
  });

  it('mục con cái nhắc rằng người đọc có thể chưa có con', () => {
    expect(GIA_DAO_SYSTEM_PROMPT[GiaDaoMucKey.ConCai]).toContain('người đọc có thể chưa có con');
  });

  it('mục cha mẹ đọc cung Phụ Mẫu', () => {
    expect(GIA_DAO_SYSTEM_PROMPT[GiaDaoMucKey.ChaMe]).toContain('Bài luận CUNG PHỤ MẪU');
  });

  it('mục cha mẹ không mặc định cha mẹ còn bên cạnh', () => {
    expect(GIA_DAO_SYSTEM_PROMPT[GiaDaoMucKey.ChaMe]).toContain(
      'không mặc định cha mẹ còn bên cạnh',
    );
  });
});
