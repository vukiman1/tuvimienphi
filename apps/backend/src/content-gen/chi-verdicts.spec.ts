import { ThaiTueRelation } from '@org/shared-tu-vi';
import {
  checkTamTai,
  checkThaiTue,
  tamTaiKeyword,
  thaiTueKeyword,
  type ChiVerdicts,
} from './chi-verdicts';

describe('checkTamTai', () => {
  const thirdYear: ChiVerdicts = { tamTai: 3, thaiTue: [] };

  it('accepts denying a Tam tai year that is not the computed one', () => {
    const text = `Năm nay không phải ${tamTaiKeyword(2)} mà là ${tamTaiKeyword(3)}.`;

    expect(checkTamTai(text, thirdYear)).toEqual([]);
  });

  it('rejects affirming a Tam tai year that is not the computed one', () => {
    const text = `Năm nay là ${tamTaiKeyword(2)}.`;

    expect(checkTamTai(text, thirdYear)).toEqual([
      `nhắc "${tamTaiKeyword(2)}" nhưng dữ kiện tính tuổi này ở ${tamTaiKeyword(3)}`,
    ]);
  });
});

describe('checkThaiTue', () => {
  const haiOnly: ChiVerdicts = { tamTai: null, thaiTue: [ThaiTueRelation.Hai] };

  it('accepts denying a Thái tuế relation the engine did not compute', () => {
    const text = `Tuổi này không ${thaiTueKeyword(ThaiTueRelation.Xung)} mà chỉ ${thaiTueKeyword(ThaiTueRelation.Hai)}.`;

    expect(checkThaiTue(text, haiOnly)).toEqual([]);
  });

  it('rejects affirming a Thái tuế relation the engine did not compute', () => {
    const text = `Tuổi này ${thaiTueKeyword(ThaiTueRelation.Xung)}.`;

    expect(checkThaiTue(text, haiOnly)).toEqual([
      `nhắc "${thaiTueKeyword(ThaiTueRelation.Xung)}" mà dữ kiện không tính cho tuổi này`,
    ]);
  });
});
