import { KimLau } from './kim-lau.js';
import { MenhVoiNam } from './menh-voi-nam.js';
import { GiaiDoanTuoi } from './giai-doan-tuoi.js';
import { tuoiNamFacts } from './tuoi-nam-facts.js';

describe('tuoiNamFacts', () => {
  it('describes Bính Dần 1986 in 2027', () =>
    expect(tuoiNamFacts(1986, 2027)).toMatchObject({
      canChi: 'Bính Dần',
      chi: 2,
      tuoi: 42,
      menh: { name: 'Lô Trung Hỏa' },
      menhNam: { name: 'Thiên Hà Thủy' },
      menhVoiNam: MenhVoiNam.NamKhacMenh,
      tamTai: null,
      thaiTue: [],
      kimLau: KimLau.Tu,
      giaiDoan: GiaiDoanTuoi.XayDung,
      nam: { sao: 'Vân Hớn' },
      nu: { sao: 'La Hầu' },
    }));
});
