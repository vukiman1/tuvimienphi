import type { NatalChart, SaoView } from '../cast-chart.js';
import { tamHopIndexes, xungChieuIndex } from '../chi.js';
import { CHI } from '../lich/lunar-calendar.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { ChinhTinhName, SaoName } from '../sao-names.js';
import type { Rating } from '../sao-rating.js';
import { CHINH_TINH_MENH } from './bang/menh/chinh-tinh-menh.js';
import type { CellLuan } from './bang/cell-luan.js';
import { PHU_TINH_LUAN } from './bang/phu-tinh.js';
import type { ChapterBrief } from './chapter-brief.js';
import { Sac, type LuanDe } from './luan-de.js';
import { TheChieu, theCungAt, type SaoTheoThe } from './the-cung.js';

const BRIGHTNESS_FACTOR: Record<Rating, number> = { M: 1.2, V: 1.1, Đ: 1.0, B: 0.9, H: 0.8 };
const THE_FACTOR: Record<TheChieu, number> = {
  [TheChieu.ToaThu]: 1,
  [TheChieu.XungChieu]: 0.75,
  [TheChieu.TamHop]: 0.6,
  [TheChieu.NhiHop]: 0.4,
};
const LIMIT: Record<Sac, number> = { [Sac.Thuan]: 2, [Sac.Nghich]: 2, [Sac.HoaGiai]: 1 };
/** Tuần hay Triệt án ngữ làm nhẹ cả mặt tốt lẫn mặt xấu, nên hạ đều chứ không hạ riêng chiều nào. */
const AN_NGU_FACTOR = 0.75;

/**
 * Chính tinh nhuộm tính cách từ cả bốn thế, không riêng sao toạ thủ: chương Mệnh đọc tam phương tứ
 * chính. Thế đi kèm để bài gọi đúng vị trí và để chấm trọng số theo mức tác động.
 */
export interface ChinhTinhTrongBai {
  readonly ten: ChinhTinhName;
  readonly bac: Rating | null;
  readonly the: TheChieu;
}

export interface MenhBrief extends ChapterBrief {
  readonly cung: 'Mệnh';
  /** Chính tinh của cả tam phương tứ chính, nên mỗi sao phải nói rõ nó chiếu tới từ thế nào. */
  readonly chinhTinh: readonly ChinhTinhTrongBai[];
}

interface DraftClaim {
  y: string;
  do: SaoName[];
  sac: Sac;
  trong: number;
  tuKhoa: string[];
}

function chinhTinhCua(sao: readonly SaoView<ChinhTinhName>[], the: TheChieu): ChinhTinhTrongBai[] {
  return sao.map((item) => ({ ten: item.name, bac: item.rating, the }));
}

function moRong(cell: CellLuan, bac: Rating | null): readonly LuanDe[] {
  return [...cell.chung, ...(bac ? (cell.theoBac?.[bac] ?? []) : [])];
}

function draft(claim: LuanDe, factor: number): DraftClaim {
  return {
    y: claim.y,
    do: [...claim.do],
    sac: claim.sac,
    trong: Math.round(claim.trong * factor),
    tuKhoa: [...claim.tuKhoa],
  };
}

function cull(claims: DraftClaim[]): DraftClaim[] {
  return Object.values(Sac).flatMap((sac) =>
    claims
      .filter((claim) => claim.sac === sac)
      .sort((a, b) => b.trong - a.trong)
      .slice(0, LIMIT[sac]),
  );
}

function phuTinhClaims(phuTinh: readonly SaoTheoThe[]): DraftClaim[] {
  return phuTinh.flatMap((sao) => {
    const claim = PHU_TINH_LUAN[sao.name];
    if (!claim) return [];
    // Cung nguồn bị án ngữ thì cái nó gửi sang cũng nhẹ đi, không riêng gì cung đang xét.
    const factor = THE_FACTOR[sao.the] * (sao.bienAnNgu ? AN_NGU_FACTOR : 1);
    return [draft(claim, factor)];
  });
}

export function buildMenhBrief(chart: NatalChart): MenhBrief | null {
  const the = theCungAt(chart, chart.menhIndex);
  const [tamHopA, tamHopB] = tamHopIndexes(chart.menhIndex);

  const chinhTinh = [
    ...chinhTinhCua(chart.cungs[chart.menhIndex].chinhTinh, TheChieu.ToaThu),
    ...chinhTinhCua(chart.cungs[xungChieuIndex(chart.menhIndex)].chinhTinh, TheChieu.XungChieu),
    ...chinhTinhCua(chart.cungs[tamHopA].chinhTinh, TheChieu.TamHop),
    ...chinhTinhCua(chart.cungs[tamHopB].chinhTinh, TheChieu.TamHop),
  ];

  const claims = [
    ...chinhTinh.flatMap((sao) => {
      const cell = CHINH_TINH_MENH[sao.ten];
      if (!cell) return [];
      const factor = THE_FACTOR[sao.the] * (BRIGHTNESS_FACTOR[sao.bac ?? 'B'] ?? 1);
      return moRong(cell, sao.bac).map((claim) => draft(claim, factor));
    }),
    ...phuTinhClaims(the.phuTinh),
  ];

  if (the.anNgu) {
    for (const claim of claims) claim.trong = Math.round(claim.trong * AN_NGU_FACTOR);
  }

  const luan = cull(claims);

  // Chính tinh là xương sống của bài: chỉ có mệnh đề phụ tinh thì bài gọi tên sao mà không nói được
  // gì về bản tính, và mạch bài cần cả chiều thuận lẫn chiều nghịch mới dựng nổi hai đoạn.
  const tenChinhTinh = new Set<SaoName>(chinhTinh.map((sao) => sao.ten));
  const coNen = luan.some((claim) => claim.do.some((sao) => tenChinhTinh.has(sao)));
  const coMach =
    luan.some((claim) => claim.sac === Sac.Thuan) && luan.some((claim) => claim.sac === Sac.Nghich);
  if (!coNen || !coMach) return null;

  // Chỉ liệt kê sao thực sự đứng sau mệnh đề còn giữ: tên sao lọt vào brief là tên bài được phép gọi.
  const daDung = new Set(luan.flatMap((claim) => claim.do));
  const phuTinhTrongBai = the.phuTinh
    .filter((sao) => daDung.has(sao.name))
    .map((sao) => ({ ten: sao.name, the: sao.the }));

  return {
    cung: 'Mệnh',
    chi: CHI[chart.menhIndex],
    gioiTinh: chart.gender,
    chiNamSinh: CHI[chart.pillars.year.chi],
    laVoChinhDieu: chart.cungs[chart.menhIndex].isVoChinhDieu,
    chinhTinh,
    hungTinh: phuTinhTrongBai.filter((sao) => isHungTinh(sao.ten)),
    catTinh: phuTinhTrongBai.filter((sao) => !isHungTinh(sao.ten)),
    anNgu: the.anNgu,
    luan,
  };
}
