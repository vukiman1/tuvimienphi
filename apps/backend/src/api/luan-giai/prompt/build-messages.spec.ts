import { Gender, Sac, TheChieu, type ChapterBrief } from '@org/shared-tu-vi';
import type { DoanChinh } from './chapter-schema';
import { buildMessages } from './build-messages';
import { serializeBriefForPrompt } from './serialize-brief';

const BRIEF: ChapterBrief = {
  cung: 'Quan Lộc',
  chi: 'Tý',
  gioiTinh: Gender.Nam,
  chiNamSinh: 'Thìn',
  chinhTinh: [{ ten: 'Thiên Lương', bac: 'M', the: TheChieu.ToaThu }],
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

const BAN_CU: DoanChinh = { doan1: 'Đoạn một.', doan2: 'Đoạn hai.' };

describe('buildMessages', () => {
  it('lượt đầu chỉ gửi brief đã tuần tự hoá', () => {
    const messages = buildMessages<DoanChinh>(BRIEF, []);

    expect(messages).toEqual([{ role: 'user', text: serializeBriefForPrompt(BRIEF) }]);
  });

  it('mỗi lượt hỏng thêm bản cũ của mô hình và danh sách lỗi', () => {
    const messages = buildMessages(BRIEF, [{ paragraph: BAN_CU, loi: ['lỗi a', 'lỗi b'] }]);

    expect(messages).toEqual([
      { role: 'user', text: serializeBriefForPrompt(BRIEF) },
      { role: 'model', text: JSON.stringify(BAN_CU) },
      {
        role: 'user',
        text: 'Bản trên vi phạm:\n- lỗi a\n- lỗi b\nViết lại cho đúng, giữ nguyên nội dung mệnh đề.',
      },
    ]);
  });
});
