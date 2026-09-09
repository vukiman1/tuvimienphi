import type { NatalChart } from '../cast-chart.js';
import type { CungName } from '../dia-ban.js';
import { CHI } from '../lich/lunar-calendar.js';
import { isHungTinh } from '../sao-cat-hung.js';
import type { ChinhTinhName, PhuTinhName, SaoName } from '../sao-names.js';
import type { Rating } from '../sao-rating.js';
import type { CellLuan } from './bang/cell-luan.js';
import type { Gender } from '../van-han.js';
import { CAP_DOI_THAN_CU } from './bang/cap-doi-than-cu.js';
import { CHINH_TINH_THAN_CU } from './bang/than-cu/index.js';
import { PHU_TINH_LUAN } from './bang/phu-tinh.js';
import { Sac, type LuanDe } from './luan-de.js';
import { TheChieu, theCungAt, type AnNgu, type SaoTheoThe, type TheCung } from './the-cung.js';
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
/**
 * Bốn thế tác động lên một cung, mạnh dần từ dưới lên. Xung chiếu là chính chiếu nên nặng hơn tam
 * hợp; nhị hợp nhẹ nhất, chỉ đủ để bổ nghĩa chứ không đủ đổi kết luận.
 */
const THE_FACTOR: Record<TheChieu, number> = {
  [TheChieu.ToaThu]: 1,
  [TheChieu.XungChieu]: 0.75,
  [TheChieu.TamHop]: 0.6,
  [TheChieu.NhiHop]: 0.4,
};
/** Tuần hay Triệt án ngữ làm nhẹ cả mặt tốt lẫn mặt xấu, nên hạ đều chứ không hạ riêng chiều nào. */
const AN_NGU_FACTOR = 0.75;
const HOA_KY_BONUS = 15;
const HOA_KHAC_BONUS = 10;

/**
 * Trần cắt phải khớp ngân sách câu của bài: bài Thân cư chỉ có hai đoạn AI viết, mỗi đoạn hai câu.
 * Đưa nhiều hơn năm mệnh đề vào bốn câu thì mô hình buộc phải liệt kê, ra danh sách chứ không ra văn.
 */
const LIMIT: Record<Sac, number> = { [Sac.Thuan]: 2, [Sac.Nghich]: 2, [Sac.HoaGiai]: 1 };

export interface SaoTrongBai {
  readonly ten: PhuTinhName;
  readonly the: TheChieu;
}

export interface ThanCuBrief {
  readonly cungThan: CungName;
  readonly chi: string;
  readonly gioiTinh: Gender;
  readonly chiNamSinh: string;
  readonly chinhTinh: readonly { readonly ten: ChinhTinhName; readonly bac: Rating | null }[];
  readonly laVoChinhDieu: boolean;
  /** Kèm thế chiếu để bài gọi đúng vị trí: chỉ sao toạ thủ mới được nói là đóng tại cung. */
  readonly hungTinh: readonly SaoTrongBai[];
  readonly catTinh: readonly SaoTrongBai[];
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

function moRong(cell: CellLuan, bac: Rating | null): readonly LuanDe[] {
  return [...cell.chung, ...(bac ? (cell.theoBac?.[bac] ?? []) : [])];
}

/**
 * Ô riêng cho tổ hợp đôi được ưu tiên; không có thì ghép từ hai ô sao đơn.
 *
 * Ghép là XẤP XỈ, không phải đúng hoàn toàn: Sát Phá Tham hay Cơ Nguyệt Đồng Lương là cách cục có
 * tên, luận theo tổ hợp chứ không luận cộng dồn. Nhưng ghép cho 83% lá số có bài đọc được, còn chờ
 * viết đủ hai mươi bốn ô đôi thì 33% lá số không có gì — nên ghép trước, viết ô riêng đè lên sau.
 */
function baseClaims(the: TheCung): DraftClaim[] {
  const brightness = the.chinhTinh.reduce(
    (product, sao) => product * (BRIGHTNESS_FACTOR[sao.rating ?? 'B'] ?? 1),
    1,
  );

  const oDoi = CAP_DOI_THAN_CU[toHopKey(the.chinhTinh)]?.[the.cung];
  if (oDoi) {
    // Phần theo bậc chỉ lấy khi cả cụm cùng một bậc: hai sao lệch bậc thì mệnh đề viết cho một bậc
    // không còn đúng cho ô đó nữa.
    const bacChung = the.chinhTinh.every((sao) => sao.rating === the.chinhTinh[0]?.rating)
      ? (the.chinhTinh[0]?.rating ?? null)
      : null;
    return moRong(oDoi, bacChung).map((claim) => draft(claim, brightness));
  }

  return the.chinhTinh.flatMap((sao) => {
    const cell = CHINH_TINH_THAN_CU[the.cung]?.[sao.name];
    return cell ? moRong(cell, sao.rating).map((claim) => draft(claim, brightness)) : [];
  });
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

  const claims = [...baseClaims(the), ...phuTinhClaims(the.phuTinh)];
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
  const daDung = new Set(luan.flatMap((claim) => claim.do));
  const phuTinhUsed: SaoTrongBai[] = [];
  for (const sao of the.phuTinh) {
    if (chinhTinhNames.has(sao.name) || !daDung.has(sao.name)) continue;
    if (phuTinhUsed.some((da) => da.ten === sao.name)) continue;
    phuTinhUsed.push({ ten: sao.name, the: sao.the });
  }

  return {
    cungThan: the.cung,
    chi: CHI[the.chiIndex],
    gioiTinh: chart.gender,
    chiNamSinh: CHI[chart.pillars.year.chi],
    chinhTinh: the.chinhTinh.map((sao) => ({ ten: sao.name, bac: sao.rating })),
    laVoChinhDieu: the.laVoChinhDieu,
    hungTinh: phuTinhUsed.filter((sao) => isHungTinh(sao.ten)),
    catTinh: phuTinhUsed.filter((sao) => !isHungTinh(sao.ten)),
    anNgu: the.anNgu,
    luan,
  };
}
