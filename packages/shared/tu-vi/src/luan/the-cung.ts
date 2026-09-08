import type { NatalChart, SaoView } from '../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../chi.js';
import type { CungName } from '../dia-ban.js';
import type { ChinhTinhName, PhuTinhName } from '../sao-names.js';
import type { TuHoa } from '../tu-hoa.js';

export type AnNgu = 'Tuần' | 'Triệt' | null;

/**
 * Toàn bộ dữ kiện cần để luận một cung. Sao hội chiếu cũng nằm trong đây: luận một cung mà chỉ đọc
 * sao toạ thủ là đọc thiếu, vì tam hợp và xung chiếu vẫn tác động lên cung đang xét.
 */
export interface TheCung {
  readonly cung: CungName;
  readonly chiIndex: number;
  readonly chinhTinh: readonly SaoView<ChinhTinhName>[];
  readonly laVoChinhDieu: boolean;
  readonly chinhTinhMuon: readonly SaoView<ChinhTinhName>[];
  readonly phuTinhToaThu: readonly PhuTinhName[];
  readonly phuTinhHoiChieu: readonly PhuTinhName[];
  /** Hoá khí rơi vào chính cung này hoặc vào cung hội chiếu của nó. */
  readonly tuHoaTacDong: readonly TuHoa[];
  readonly anNgu: AnNgu;
}

export function theCungAt(chart: NatalChart, chiIndex: number): TheCung {
  const cung = chart.cungs[chiIndex];
  const hoiChieu = [...tamHopIndexes(chiIndex), xungChieuIndex(chiIndex)];
  const phuTinhToaThu = cung.phuTinh.map((sao) => sao.name);
  const phuTinhHoiChieu = hoiChieu.flatMap((index) =>
    chart.cungs[index].phuTinh.map((sao) => sao.name),
  );

  const coMat = new Set<string>([...phuTinhToaThu, ...phuTinhHoiChieu]);

  return {
    cung: cung.name as CungName,
    chiIndex,
    chinhTinh: cung.chinhTinh,
    laVoChinhDieu: cung.isVoChinhDieu,
    chinhTinhMuon: cung.chinhTinhMuon,
    phuTinhToaThu,
    phuTinhHoiChieu,
    tuHoaTacDong: chart.tuHoa.filter((hoa) => coMat.has(hoa.hoa)),
    anNgu: cung.hasTuan ? 'Tuần' : cung.hasTriet ? 'Triệt' : null,
  };
}
