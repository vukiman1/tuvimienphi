import { anChinhTinh } from '../an-chinh-tinh.js';
import { CUNG_NAMES } from '../dia-ban.js';
import { CHINH_TINH_THAN_CU } from './bang/chinh-tinh-than-cu.js';
import { THAN_CU_CUNGS } from './build-than-cu-brief.js';
import { TO_HOP_VO_CHINH_DIEU, toHopKey } from './to-hop.js';

/** Mọi tổ hợp chính tinh một cung có thể mang, suy ra từ chính phép an sao. */
function moiToHop(): Set<string> {
  const ket = new Set<string>([TO_HOP_VO_CHINH_DIEU]);
  for (let cuc = 2; cuc <= 6; cuc += 1) {
    for (let ngay = 1; ngay <= 30; ngay += 1) {
      const theoChi = new Map<number, { name: string }[]>();
      for (const sao of anChinhTinh(ngay, cuc)) {
        theoChi.set(sao.chiIndex, [...(theoChi.get(sao.chiIndex) ?? []), { name: sao.name }]);
      }
      for (let chi = 0; chi < CUNG_NAMES.length; chi += 1) {
        ket.add(toHopKey((theoChi.get(chi) ?? []) as never));
      }
    }
  }
  return ket;
}

describe('bảng mệnh đề nền cho chương Thân cư', () => {
  const hopLe = moiToHop();

  it('không có khoá tổ hợp nào nằm ngoài những tổ hợp thực sự an được', () => {
    const la = Object.keys(CHINH_TINH_THAN_CU).filter((khoa) => !hopLe.has(khoa));
    expect(la).toEqual([]);
  });

  it('không có khoá cung nào nằm ngoài sáu cung Thân có thể an vào', () => {
    const la = Object.entries(CHINH_TINH_THAN_CU).flatMap(([toHop, theoCung]) =>
      Object.keys(theoCung ?? {})
        .filter((cung) => !THAN_CU_CUNGS.includes(cung as never))
        .map((cung) => `${toHop} @ ${cung}`),
    );
    expect(la).toEqual([]);
  });

  it('báo mức phủ hiện tại để theo dõi tiến độ biên soạn', () => {
    const can = hopLe.size * THAN_CU_CUNGS.length;
    const co = Object.values(CHINH_TINH_THAN_CU).reduce(
      (tong, theoCung) => tong + Object.keys(theoCung ?? {}).length,
      0,
    );
    expect(can).toBeGreaterThan(0);
    expect(co).toBeGreaterThan(0);
    expect(co).toBeLessThanOrEqual(can);
  });
});
