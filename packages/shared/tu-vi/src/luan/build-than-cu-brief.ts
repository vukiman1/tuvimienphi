import type { NatalChart } from '../cast-chart.js';
import type { CungName } from '../dia-ban.js';
import { CHI } from '../lich/lunar-calendar.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { ChinhTinhName, PhuTinhName, SaoName } from '../sao-names.js';
import type { Rating } from '../sao-rating.js';
import type { Gender } from '../van-han.js';
import { CHINH_TINH_THAN_CU } from './bang/chinh-tinh-than-cu.js';
import { PHU_TINH_LUAN } from './bang/phu-tinh.js';
import { Sac, type LuanDe } from './luan-de.js';
import { theCungAt, type AnNgu, type TheCung } from './the-cung.js';
import { toHopKey } from './to-hop.js';

/** Thân chỉ an vào sáu cung này, không bao giờ vào sáu cung còn lại. `than-cu.spec.ts` kiểm lại. */
export const THAN_CU_CUNGS = [
  'Mệnh',
  'Phúc Đức',
  'Quan Lộc',
  'Thiên Di',
  'Tài Bạch',
  'Phu Thê',
] as const satisfies readonly CungName[];

const BRIGHTNESS_FACTOR: Record<Rating, number> = { M: 1.2, V: 1.1, Đ: 1.0, B: 0.9, H: 0.8 };
const HOI_CHIEU_FACTOR = 0.6;
/** Tuần hay Triệt án ngữ làm nhẹ cả mặt tốt lẫn mặt xấu, nên hạ đều chứ không hạ riêng chiều nào. */
const AN_NGU_FACTOR = 0.75;
const HOA_KY_BONUS = 15;
const HOA_KHAC_BONUS = 10;

/**
 * Trần cắt phải khớp ngân sách câu của bài: bài Thân cư chỉ có hai đoạn AI viết, mỗi đoạn hai câu.
 * Đưa nhiều hơn năm mệnh đề vào bốn câu thì mô hình buộc phải liệt kê, ra danh sách chứ không ra văn.
 */
const LIMIT: Record<Sac, number> = { [Sac.Thuan]: 2, [Sac.Nghich]: 2, [Sac.HoaGiai]: 1 };

export interface ThanCuBrief {
  readonly cungThan: CungName;
  readonly chi: string;
  readonly gioiTinh: Gender;
  readonly chiNamSinh: string;
  readonly chinhTinh: readonly { readonly ten: ChinhTinhName; readonly bac: Rating | null }[];
  readonly laVoChinhDieu: boolean;
  readonly hungTinh: readonly PhuTinhName[];
  readonly catTinh: readonly PhuTinhName[];
  readonly anNgu: AnNgu;
  readonly luan: readonly LuanDe[];
}

interface DraftClaim {
  y: string;
  do: SaoName[];
  sac: Sac;
  trong: number;
  tuKhoa: string[];
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

function baseClaims(the: TheCung): DraftClaim[] {
  const cell = CHINH_TINH_THAN_CU[toHopKey(the.chinhTinh)]?.[the.cung];
  if (!cell) return [];

  const brightness = the.chinhTinh.reduce(
    (product, sao) => product * (BRIGHTNESS_FACTOR[sao.rating ?? 'B'] ?? 1),
    1,
  );

  // Phần riêng theo bậc chỉ lấy khi cả cụm chính tinh cùng một bậc: hai sao lệch bậc thì mệnh đề
  // viết cho một bậc không còn đúng cho ô đó nữa.
  const bacChung = the.chinhTinh.every((sao) => sao.rating === the.chinhTinh[0]?.rating)
    ? the.chinhTinh[0]?.rating
    : null;
  const theoBac = bacChung ? (cell.theoBac?.[bacChung] ?? []) : [];

  return [...cell.chung, ...theoBac].map((claim) => draft(claim, brightness));
}

function phuTinhClaims(names: readonly PhuTinhName[], factor: number): DraftClaim[] {
  return names.flatMap((sao) => {
    const claim = PHU_TINH_LUAN[sao];
    return claim ? [draft(claim, factor)] : [];
  });
}

/** Hoá Kỵ lật hẳn chiều của mệnh đề nó bám vào; ba hoá còn lại chỉ nâng trọng số. */
function applyTuHoa(claims: DraftClaim[], the: TheCung): void {
  for (const hoa of the.tuHoaTacDong) {
    for (const claim of claims) {
      if (!claim.do.includes(hoa.star)) continue;
      if (hoa.hoa === 'Hóa Kỵ') {
        claim.sac = Sac.Nghich;
        claim.trong += HOA_KY_BONUS;
      } else {
        claim.trong += HOA_KHAC_BONUS;
      }
    }
  }
}

function mergeDuplicates(claims: DraftClaim[]): DraftClaim[] {
  const merged = new Map<string, DraftClaim>();
  for (const claim of claims) {
    const existing = merged.get(claim.y);
    if (!existing) {
      merged.set(claim.y, claim);
      continue;
    }
    existing.trong = Math.max(existing.trong, claim.trong);
    for (const sao of claim.do) if (!existing.do.includes(sao)) existing.do.push(sao);
  }
  return [...merged.values()];
}

function cull(claims: DraftClaim[]): DraftClaim[] {
  return Object.values(Sac).flatMap((sac) =>
    claims
      .filter((claim) => claim.sac === sac)
      .sort((a, b) => b.trong - a.trong)
      .slice(0, LIMIT[sac]),
  );
}

/**
 * Dựng brief cho chương Thân cư. Trả `null` khi bảng chưa đủ để dựng nổi mạch bài. Giao diện đã có
 * chỗ cho chương chưa biên soạn, nên thiếu thì bỏ trống chứ đừng sinh bài rỗng.
 */
export function buildThanCuBrief(chart: NatalChart): ThanCuBrief | null {
  const the = theCungAt(chart, chart.thanIndex);

  const claims = [
    ...baseClaims(the),
    ...phuTinhClaims(the.phuTinhToaThu, 1),
    ...phuTinhClaims(the.phuTinhHoiChieu, HOI_CHIEU_FACTOR),
  ];
  applyTuHoa(claims, the);
  if (the.anNgu) {
    for (const claim of claims) claim.trong = Math.round(claim.trong * AN_NGU_FACTOR);
  }
  const luan = cull(mergeDuplicates(claims));

  const chinhTinhNames = new Set<SaoName>(the.chinhTinh.map((sao) => sao.name));

  // Chính tinh là xương sống của bài: câu mở phải dẫn được tên nó kèm bậc. Chỉ có mệnh đề phụ tinh
  // thì bài gọi tên chính tinh mà không nói được gì về nó — rỗng ruột, thà bỏ trống.
  const hasBase = luan.some((claim) => claim.do.some((sao) => chinhTinhNames.has(sao)));
  const hasArc =
    luan.some((claim) => claim.sac === Sac.Thuan) && luan.some((claim) => claim.sac === Sac.Nghich);
  if (!hasBase || !hasArc) return null;

  // Chỉ liệt kê sao thực sự đứng sau mệnh đề còn giữ: tên sao lọt vào brief là tên bài được phép gọi.
  const phuTinhUsed = [...new Set(luan.flatMap((claim) => claim.do))].filter(
    (sao): sao is PhuTinhName => !chinhTinhNames.has(sao),
  );

  return {
    cungThan: the.cung,
    chi: CHI[the.chiIndex],
    gioiTinh: chart.gender,
    chiNamSinh: CHI[chart.pillars.year.chi],
    chinhTinh: the.chinhTinh.map((sao) => ({ ten: sao.name, bac: sao.rating })),
    laVoChinhDieu: the.laVoChinhDieu,
    hungTinh: phuTinhUsed.filter(isHungTinh),
    catTinh: phuTinhUsed.filter((sao) => !isHungTinh(sao)),
    anNgu: the.anNgu,
    luan,
  };
}
