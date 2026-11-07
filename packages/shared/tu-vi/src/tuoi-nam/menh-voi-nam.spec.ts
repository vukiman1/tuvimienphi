import { menhVoiNam, MenhVoiNam } from './menh-voi-nam.js';

describe('menhVoiNam', () => {
  it('lets Thiên Hà Thủy overcome Lư Trung Hỏa', () => {
    expect(menhVoiNam('Hỏa', 'Thủy')).toBe(MenhVoiNam.NamKhacMenh);
  });

  it.each([
    ['Hỏa', 'Hỏa', MenhVoiNam.BinhHoa],
    ['Hỏa', 'Mộc', MenhVoiNam.NamSinhMenh],
    ['Mộc', 'Hỏa', MenhVoiNam.MenhSinhNam],
    ['Mộc', 'Kim', MenhVoiNam.NamKhacMenh],
    ['Kim', 'Mộc', MenhVoiNam.MenhKhacNam],
  ] as const)('relates mệnh %s to year %s', (menh, nam, relation) => {
    expect(menhVoiNam(menh, nam)).toBe(relation);
  });
});
