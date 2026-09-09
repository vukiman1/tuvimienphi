import type { NatalChart, NatalCungView, SaoView } from '../cast-chart.js';
import { nhiHopIndex, tamHopIndexes, xungChieuIndex } from '../chi.js';
import type { CungName } from '../dia-ban.js';
import type { ChinhTinhName, PhuTinhName } from '../sao-names.js';
import type { TuHoa } from '../tu-hoa.js';

export type AnNgu = 'Tuần' | 'Triệt' | null;

/**
 * Sao tác động tới một cung theo bốn thế, xếp từ mạnh xuống nhẹ. Nhãn viết đúng cách gọi trên lá số
 * để mô hình dùng lại được nguyên văn — gọi một sao xung chiếu là "toạ thủ" là nói sai vị trí.
 */
export enum TheChieu {
  ToaThu = 'toạ thủ',
  XungChieu = 'xung chiếu',
  TamHop = 'tam hợp',
  NhiHop = 'nhị hợp',
}

export interface SaoTheoThe {
  readonly name: PhuTinhName;
  readonly the: TheChieu;
  /** Cung nó đứng có bị Tuần hay Triệt án ngữ không — án ngữ làm nhẹ cả phần nó gửi sang. */
  readonly bienAnNgu: boolean;
}

/**
 * Toàn bộ dữ kiện cần để luận một cung. Luận một cung mà chỉ đọc sao toạ thủ là đọc thiếu: tam hợp,
 * xung chiếu và nhị hợp đều tác động, chỉ khác mức.
 */
export interface TheCung {
  readonly cung: CungName;
  readonly chiIndex: number;
  readonly chinhTinh: readonly SaoView<ChinhTinhName>[];
  readonly laVoChinhDieu: boolean;
  readonly chinhTinhMuon: readonly SaoView<ChinhTinhName>[];
  readonly phuTinh: readonly SaoTheoThe[];
  /** Hoá khí rơi vào chính cung này hoặc vào cung có thế chiếu tới nó. */
  readonly tuHoaTacDong: readonly TuHoa[];
  readonly anNgu: AnNgu;
}

function anNguCua(cung: NatalCungView): AnNgu {
  return cung.hasTuan ? 'Tuần' : cung.hasTriet ? 'Triệt' : null;
}

function saoCua(cung: NatalCungView, the: TheChieu): SaoTheoThe[] {
  const bienAnNgu = anNguCua(cung) !== null;
  return cung.phuTinh.map((sao) => ({ name: sao.name, the, bienAnNgu }));
}

export function theCungAt(chart: NatalChart, chiIndex: number): TheCung {
  const cung = chart.cungs[chiIndex];
  const [tamHopA, tamHopB] = tamHopIndexes(chiIndex);

  const phuTinh = [
    ...saoCua(cung, TheChieu.ToaThu),
    ...saoCua(chart.cungs[xungChieuIndex(chiIndex)], TheChieu.XungChieu),
    ...saoCua(chart.cungs[tamHopA], TheChieu.TamHop),
    ...saoCua(chart.cungs[tamHopB], TheChieu.TamHop),
    ...saoCua(chart.cungs[nhiHopIndex(chiIndex)], TheChieu.NhiHop),
  ];

  const coMat = new Set<string>(phuTinh.map((sao) => sao.name));

  return {
    cung: cung.name as CungName,
    chiIndex,
    chinhTinh: cung.chinhTinh,
    laVoChinhDieu: cung.isVoChinhDieu,
    chinhTinhMuon: cung.chinhTinhMuon,
    phuTinh,
    tuHoaTacDong: chart.tuHoa.filter((hoa) => coMat.has(hoa.hoa)),
    anNgu: anNguCua(cung),
  };
}
