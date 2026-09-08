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

const HE_SO_BAC: Record<Rating, number> = { M: 1.2, V: 1.1, Đ: 1.0, B: 0.9, H: 0.8 };
const HE_SO_HOI_CHIEU = 0.6;
/** Tuần hay Triệt án ngữ làm nhẹ cả mặt tốt lẫn mặt xấu, nên hạ đều chứ không hạ riêng chiều nào. */
const HE_SO_AN_NGU = 0.75;
const THUONG_HOA_KY = 15;
const THUONG_HOA_KHAC = 10;

/**
 * Trần cắt phải khớp ngân sách câu của bài: bài Thân cư chỉ có hai đoạn AI viết, mỗi đoạn hai câu.
 * Đưa nhiều hơn năm mệnh đề vào bốn câu thì mô hình buộc phải liệt kê, ra danh sách chứ không ra văn.
 */
const TRAN: Record<Sac, number> = { [Sac.Thuan]: 2, [Sac.Nghich]: 2, [Sac.HoaGiai]: 1 };

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

type MenhDe = {
  -readonly [K in keyof LuanDe]: LuanDe[K] extends readonly (infer U)[] ? U[] : LuanDe[K];
};

function nen(the: TheCung): MenhDe[] {
  const bang = CHINH_TINH_THAN_CU[toHopKey(the.chinhTinh)]?.[the.cung] ?? [];
  return bang.map((de) => ({ ...de, do: [...de.do], tuKhoa: [...de.tuKhoa] }));
}

function theoBac(de: MenhDe[], the: TheCung): MenhDe[] {
  const heSo = the.chinhTinh.reduce((tich, sao) => tich * (HE_SO_BAC[sao.rating ?? 'B'] ?? 1), 1);
  return de.map((mot) => ({ ...mot, trong: Math.round(mot.trong * heSo) }));
}

function tuPhuTinh(ten: readonly PhuTinhName[], heSo: number): MenhDe[] {
  return ten.flatMap((sao) => {
    const de = PHU_TINH_LUAN[sao];
    if (!de) return [];
    return [{ ...de, do: [...de.do], tuKhoa: [...de.tuKhoa], trong: Math.round(de.trong * heSo) }];
  });
}

/** Hoá Kỵ lật hẳn chiều của mệnh đề nó bám vào; ba hoá còn lại chỉ nâng trọng số. */
function theoTuHoa(de: MenhDe[], the: TheCung): MenhDe[] {
  for (const hoa of the.tuHoaTacDong) {
    for (const mot of de) {
      if (!mot.do.includes(hoa.star)) continue;
      if (hoa.hoa === 'Hóa Kỵ') {
        mot.sac = Sac.Nghich;
        mot.trong += THUONG_HOA_KY;
      } else {
        mot.trong += THUONG_HOA_KHAC;
      }
    }
  }
  return de;
}

function gopTrung(de: MenhDe[]): MenhDe[] {
  const theoY = new Map<string, MenhDe>();
  for (const mot of de) {
    const cu = theoY.get(mot.y);
    if (!cu) {
      theoY.set(mot.y, mot);
      continue;
    }
    cu.trong = Math.max(cu.trong, mot.trong);
    for (const sao of mot.do) if (!cu.do.includes(sao)) cu.do.push(sao);
  }
  return [...theoY.values()];
}

function cat(de: MenhDe[]): MenhDe[] {
  return Object.values(Sac).flatMap((sac) =>
    de
      .filter((mot) => mot.sac === sac)
      .sort((a, b) => b.trong - a.trong)
      .slice(0, TRAN[sac]),
  );
}

/**
 * Dựng brief cho chương Thân cư. Trả `null` khi bảng chưa đủ để dựng nổi mạch bài. Giao diện đã có
 * chỗ cho chương chưa biên soạn, nên thiếu thì bỏ trống chứ đừng sinh bài rỗng.
 */
export function buildThanCuBrief(chart: NatalChart): ThanCuBrief | null {
  const the = theCungAt(chart, chart.thanIndex);

  let de = nen(the);
  de = theoBac(de, the);
  de.push(...tuPhuTinh(the.phuTinhToaThu, 1));
  de.push(...tuPhuTinh(the.phuTinhHoiChieu, HE_SO_HOI_CHIEU));
  de = theoTuHoa(de, the);
  if (the.anNgu) de = de.map((mot) => ({ ...mot, trong: Math.round(mot.trong * HE_SO_AN_NGU) }));
  const luan = cat(gopTrung(de));

  const chinhTinhTen = new Set<SaoName>(the.chinhTinh.map((sao) => sao.name));

  // Chính tinh là xương sống của bài: câu mở phải dẫn được tên nó kèm bậc. Chỉ có mệnh đề phụ tinh
  // thì bài gọi tên chính tinh mà không nói được gì về nó — rỗng ruột, thà bỏ trống.
  const coNen = luan.some((mot) => mot.do.some((sao) => chinhTinhTen.has(sao)));
  const coDuMach =
    luan.some((mot) => mot.sac === Sac.Thuan) && luan.some((mot) => mot.sac === Sac.Nghich);
  if (!coNen || !coDuMach) return null;

  // Chỉ liệt kê sao thực sự đứng sau mệnh đề còn giữ: tên sao lọt vào brief là tên bài được phép gọi.
  const phuTinhDung = [...new Set(luan.flatMap((mot) => mot.do))].filter(
    (sao): sao is PhuTinhName => !chinhTinhTen.has(sao),
  );

  return {
    cungThan: the.cung,
    chi: CHI[the.chiIndex],
    gioiTinh: chart.gender,
    chiNamSinh: CHI[chart.pillars.year.chi],
    chinhTinh: the.chinhTinh.map((sao) => ({ ten: sao.name, bac: sao.rating })),
    laVoChinhDieu: the.laVoChinhDieu,
    hungTinh: phuTinhDung.filter(isHungTinh),
    catTinh: phuTinhDung.filter((sao) => !isHungTinh(sao)),
    anNgu: the.anNgu,
    luan,
  };
}
