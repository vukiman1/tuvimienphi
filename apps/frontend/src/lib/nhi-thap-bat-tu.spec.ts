import { getNhiThapBatTu } from './nhi-thap-bat-tu';

describe('getNhiThapBatTu', () => {
  // Verified against lichdungsu /nhi-thap-bat-tu?d=11&m=08&y=2026&h=15.
  it('matches the four pillar tú for 2026-08-11 15h', () => {
    const { pillars } = getNhiThapBatTu(new Date(2026, 7, 11), 15);
    const byLabel = Object.fromEntries(pillars.map((p) => [p.label, p.tu]));

    expect(byLabel['Năm'].fullName).toBe('Tinh Nhật Mã');
    expect(byLabel['Năm'].animal).toBe('Ngựa');
    expect(byLabel['Tháng'].fullName).toBe('Cang Kim Long');
    expect(byLabel['Ngày'].fullName).toBe('Chủy Hỏa Cầu');
    expect(byLabel['Ngày'].animal).toBe('Khỉ');
    expect(byLabel['Giờ'].fullName).toBe('Chẩn Thủy Dẫn');
    expect(byLabel['Giờ'].animal).toBe('Con Giun');
  });

  it('gives the hour pillar its ngũ thử độn can chi', () => {
    const { pillars } = getNhiThapBatTu(new Date(2026, 7, 11), 15);
    expect(pillars.find((p) => p.label === 'Giờ')?.canChi).toBe('Mậu Thân');
  });

  it('carries the luận verse for each tú', () => {
    const { verses } = getNhiThapBatTu(new Date(2026, 7, 11), 15);
    expect(verses[0].tu.verse[0]).toBe('Sao Tinh tỏ rạng hợp xây nhà');
  });
});
