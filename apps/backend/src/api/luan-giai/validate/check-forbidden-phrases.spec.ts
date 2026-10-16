import { Sac, type ThanCuBrief } from '@org/shared-tu-vi';
import type { BaiCanKiem } from './bai-can-kiem';
import { checkForbiddenPhrases } from './check-forbidden-phrases';

const BRIEF_PHU_THE: ThanCuBrief = {
  cung: 'Phu Thê',
  chi: 'Tị',
  gioiTinh: 'nam' as ThanCuBrief['gioiTinh'],
  chiNamSinh: 'Tý',
  chinhTinh: [],
  laVoChinhDieu: true,
  hungTinh: [],
  catTinh: [],
  anNgu: 'Tuần',
  luan: [],
};

const BRIEF_TAI_BACH: ThanCuBrief = { ...BRIEF_PHU_THE, cung: 'Tài Bạch' };

function bai(...doan: string[]): BaiCanKiem {
  return {
    doan,
    doanCuaSac: { [Sac.Thuan]: 0, [Sac.Nghich]: 0, [Sac.HoaGiai]: 0 },
  };
}

describe('checkForbiddenPhrases với cung Phu Thê', () => {
  it('chặn từ "chồng" và nêu đúng số đoạn', () => {
    const loi = checkForbiddenPhrases(
      BRIEF_PHU_THE,
      bai('Người ấy hiền.', 'Với chồng bạn sẽ hợp.'),
    );
    expect(loi).toEqual(['đoạn 2: dùng cụm bị cấm "chồng"']);
  });

  it('chặn "Vợ" viết hoa ở đầu câu', () => {
    const loi = checkForbiddenPhrases(BRIEF_PHU_THE, bai('Vợ bạn là người đảm đang.'));
    expect(loi).toEqual(['đoạn 1: dùng cụm bị cấm "vợ"']);
  });

  it.each(['việc chồng chất', 'công việc chồng chéo', 'cây vợt tennis'])(
    'cho qua từ chỉ giống "vợ/chồng" về mặt chữ: %s',
    (cau) => {
      expect(checkForbiddenPhrases(BRIEF_PHU_THE, bai(cau))).toEqual([]);
    },
  );
});

describe('checkForbiddenPhrases với cung khác Phu Thê', () => {
  it('không chặn "chồng"', () => {
    expect(checkForbiddenPhrases(BRIEF_TAI_BACH, bai('Chồng bạn có thu nhập ổn.'))).toEqual([]);
  });
});
