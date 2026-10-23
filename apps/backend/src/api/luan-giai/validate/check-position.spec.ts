import { Gender, Sac, TheChieu, type ChapterBrief } from '@org/shared-tu-vi';
import { checkPosition } from './check-position';
import { baiChinh } from './to-bai';

const BRIEF: ChapterBrief = {
  cung: 'Mệnh',
  chi: 'Tị',
  gioiTinh: Gender.Nam,
  chiNamSinh: 'Tý',
  chinhTinh: [
    { ten: 'Tử Vi', bac: null, the: TheChieu.ToaThu },
    { ten: 'Thái Dương', bac: null, the: TheChieu.XungChieu },
  ],
  laVoChinhDieu: false,
  hungTinh: [],
  catTinh: [],
  anNgu: null,
  luan: [{ y: 'người có uy', do: ['Tử Vi'], sac: Sac.Thuan, trong: 90, tuKhoa: ['uy'] }],
};

const baiVoiCau = (cau: string): ReturnType<typeof baiChinh> =>
  baiChinh({ doan1: cau, doan2: 'Đoạn hai không nhắc sao nào.' });

describe('checkPosition', () => {
  it('chặn chính tinh xung chiếu bị nói là toạ thủ', () => {
    const loi = checkPosition(BRIEF, baiVoiCau('**Thái Dương** toạ thủ, mang lại sự ấm áp.'));

    expect(loi).toHaveLength(1);
    expect(loi[0]).toMatch(/Thái Dương.*xung chiếu.*không đứng tại cung/);
  });

  it('cho qua chính tinh toạ thủ được nói là toạ thủ', () => {
    expect(checkPosition(BRIEF, baiVoiCau('**Tử Vi** toạ thủ, mang lại uy quyền.'))).toEqual([]);
  });

  it('chặn chính tinh mượn ở cung vô chính diệu', () => {
    const briefVoChinhDieu: ChapterBrief = {
      ...BRIEF,
      laVoChinhDieu: true,
      chinhTinh: [{ ten: 'Thái Dương', bac: null, the: TheChieu.XungChieu }],
    };

    const loi = checkPosition(briefVoChinhDieu, baiVoiCau('**Thái Dương** đóng tại cung này.'));

    expect(loi).toHaveLength(1);
    expect(loi[0]).toMatch(/Thái Dương.*xung chiếu.*không đứng tại cung/);
  });
});
