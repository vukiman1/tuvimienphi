import { Gender, Sac, type ChapterBrief } from '@org/shared-tu-vi';
import { serializeBriefForPrompt } from './serialize-brief';

const BRIEF: ChapterBrief = {
  cung: 'Quan Lộc',
  chi: 'Tý',
  gioiTinh: Gender.Nam,
  chiNamSinh: 'Thìn',
  chinhTinh: [{ ten: 'Thiên Lương', bac: 'M' }],
  laVoChinhDieu: false,
  hungTinh: [],
  catTinh: [],
  anNgu: null,
  luan: [
    {
      y: 'được tin tưởng giao vai trò gỡ việc khó',
      do: ['Thiên Lương'],
      sac: Sac.Thuan,
      trong: 77,
      tuKhoa: ['gỡ việc khó'],
    },
  ],
};

describe('serializeBriefForPrompt', () => {
  it('bỏ trường trong khỏi mệnh đề trước khi gửi cho mô hình', () => {
    const text = serializeBriefForPrompt(BRIEF);

    expect(text).not.toContain('"trong"');
  });

  it('vẫn giữ nguyên các trường mô hình cần đọc', () => {
    const text = serializeBriefForPrompt(BRIEF);
    const parsed = JSON.parse(text);

    expect(parsed.luan[0]).toMatchObject({
      y: 'được tin tưởng giao vai trò gỡ việc khó',
      do: ['Thiên Lương'],
      sac: 'thuan',
      tuKhoa: ['gỡ việc khó'],
    });
  });

  it('không lỗi khi luan rỗng', () => {
    const text = serializeBriefForPrompt({ ...BRIEF, luan: [] });

    expect(JSON.parse(text).luan).toEqual([]);
  });
});
