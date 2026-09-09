import { anChinhTinh } from '../an-chinh-tinh.js';
import { CUNG_NAMES } from '../dia-ban.js';
import { CAP_DOI_THAN_CU } from './bang/cap-doi-than-cu.js';
import { CHINH_TINH_THAN_CU } from './bang/than-cu/index.js';
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

  it('chỉ soạn cho sáu cung Thân có thể an vào', () => {
    expect(Object.keys(CHINH_TINH_THAN_CU).sort()).toEqual([...THAN_CU_CUNGS].sort());
  });

  it('không có khoá tổ hợp đôi nào nằm ngoài những tổ hợp thực sự an được', () => {
    const la = Object.keys(CAP_DOI_THAN_CU).filter((khoa) => !hopLe.has(khoa));
    expect(la).toEqual([]);
  });

  it('mọi ô đều có ít nhất một mệnh đề thuận và một mệnh đề nghịch để dựng nổi mạch bài', () => {
    const thieu: string[] = [];
    for (const [cung, theoSao] of Object.entries(CHINH_TINH_THAN_CU)) {
      for (const [sao, cell] of Object.entries(theoSao ?? {})) {
        const sac = new Set(cell.chung.map((menhDe) => menhDe.sac));
        if (!sac.has('thuan' as never) || !sac.has('nghich' as never)) {
          thieu.push(`${cung} · ${sao}`);
        }
      }
    }
    expect(thieu).toEqual([]);
  });

  it('báo mức phủ hiện tại để theo dõi tiến độ biên soạn', () => {
    const soO = Object.values(CHINH_TINH_THAN_CU).reduce(
      (tong: number, theoSao) => tong + Object.keys(theoSao ?? {}).length,
      0,
    );
    // Mười bốn chính tinh × sáu cung Thân. Ô đôi ghép từ hai ô đơn nên không tính riêng ở đây.
    expect(soO).toBeGreaterThan(0);
    expect(soO).toBeLessThanOrEqual(14 * THAN_CU_CUNGS.length);
  });
});
