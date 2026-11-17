import { ContentKind, EntryGroup } from '@org/shared-contracts';
import {
  anCungMenh,
  anCungThan,
  anTieuHan,
  anTriet,
  CHI,
  chomMembers,
  ChinhTinhChom,
  CHINH_TINH_NAMES,
  CHINH_TINH_NGU_HANH,
  CUC_BY_ELEMENT,
  CUNG_NAMES,
  Gender,
  HOA_NAMES,
  LUU_TINH_NAMES,
  PHU_TINH_NAMES,
  type CungName,
  type NguHanh,
  type SaoName,
} from '@org/shared-tu-vi';
import {
  castSampleChart,
  KIEN_THUC_ENTRIES,
  saoFacts,
  SaoKind,
  type PlannedLesson,
} from '@org/shared-kien-thuc';

const MONTHS = 12;
const HOURS = 12;
const CAN_COUNT = 10;
const CAN_NAMES = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const NGU_HANH_ORDER: readonly NguHanh[] = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];
const SINH_CYCLE = 'Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc.';
const KHAC_CYCLE = 'Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc.';
const TAM_HOP_GROUP_CHIS = [8, 2, 5, 11];

export function thanCungCandidates(): readonly CungName[] {
  const offsets = new Set<number>();
  for (let month = 1; month <= MONTHS; month += 1) {
    for (let hour = 0; hour < HOURS; hour += 1) {
      const menh = anCungMenh(month, hour);
      const than = anCungThan(month, hour);
      offsets.add((than - menh + CUNG_NAMES.length) % CUNG_NAMES.length);
    }
  }
  return CUNG_NAMES.filter((_, index) => offsets.has(index));
}

function phuTinhV1(): readonly SaoName[] {
  const names: SaoName[] = [];
  for (const entry of KIEN_THUC_ENTRIES) {
    if (entry.kind === ContentKind.Sao && entry.group === EntryGroup.PhuTinh)
      names.push(entry.star);
  }
  return names;
}

function doiLaSoLines(): readonly string[] {
  const chart = castSampleChart();
  const menh = chart.cungs.find((cung) => cung.isMenh);
  const than = chart.cungs.find((cung) => cung.isThan);
  const menhStars = menh === undefined ? '' : menh.chinhTinh.map((star) => star.name).join(', ');
  return [
    `Mệnh ở ${menh?.chiIndex === undefined ? '' : CHI[menh.chiIndex]} với ${menhStars}.`,
    `Thân cư ${than?.name ?? ''}.`,
    `Cục: ${chart.cuc.name}; bản mệnh: ${chart.banMenh}.`,
    `Bốn hóa: ${chart.tuHoa.map((row) => `${row.hoa} ở ${row.star}`).join(', ')}.`,
  ];
}

const BY_SLUG: Readonly<Record<string, () => readonly string[]>> = {
  'tu-vi-la-gi': () => [
    `Một lá số có ${CUNG_NAMES.length} cung, ${CHINH_TINH_NAMES.length} chính tinh và ${PHU_TINH_NAMES.length} phụ tinh.`,
  ],
  'la-so-tu-vi-gom-nhung-gi': () => [
    `Mười hai cung: ${CUNG_NAMES.join(', ')}.`,
    'Ô giữa ghi bản mệnh, cục, Mệnh chủ, Thân chủ, cân lượng và tuổi khởi đại vận.',
  ],
  'am-duong-ngu-hanh-co-ban': () => [
    `Năm hành: ${NGU_HANH_ORDER.join(', ')}.`,
    `Vòng sinh: ${SINH_CYCLE}`,
    `Vòng khắc: ${KHAC_CYCLE}`,
  ],
  '12-cung-tu-vi': () => [`Mười hai cung theo thứ tự địa bàn: ${CUNG_NAMES.join(', ')}.`],
  'cung-menh-va-cung-than': () => [
    `Thân chỉ rơi vào sáu cung: ${thanCungCandidates().join(', ')}.`,
  ],
  'tam-hop-xung-chieu': () => [
    `Mỗi cung có một đối cung và hai cung tam hợp; ví dụ Mệnh đối Thiên Di, tam hợp Tài Bạch và Quan Lộc.`,
  ],
  'y-nghia-chinh-tinh': () =>
    CHINH_TINH_NAMES.map((name) => `${name}: hành ${CHINH_TINH_NGU_HANH[name]}.`),
  'chom-tu-vi-va-chom-thien-phu': () => [
    `Chòm Tử Vi: ${chomMembers(ChinhTinhChom.TuVi).join(', ')}.`,
    `Chòm Thiên Phủ: ${chomMembers(ChinhTinhChom.ThienPhu).join(', ')}.`,
  ],
  'mieu-vuong-dac-binh-ham': () => [
    'Năm bậc, theo chữ: miếu (M), vượng (V), đắc địa (Đ), bình hòa (B), hãm (H).',
    `Thái Dương: ${saoFacts('Thái Dương')
      .ratings.map((cell) => `${CHI[cell.chi]} ${cell.rating}`)
      .join(', ')}.`,
    `Thái Âm: ${saoFacts('Thái Âm')
      .ratings.map((cell) => `${CHI[cell.chi]} ${cell.rating}`)
      .join(', ')}.`,
  ],
  'phu-tinh-thuong-gap': () =>
    phuTinhV1().map((name) => {
      const facts = saoFacts(name);
      const hung = facts.kind === SaoKind.PhuTinh && facts.isHung ? 'hung' : 'cát';
      return `${name}: hành ${facts.hanh}, ${hung}.`;
    }),
  'tu-hoa-la-gi': () => [
    `Bốn hóa: ${HOA_NAMES.join(', ')}; Hóa Kỵ là hung.`,
    'Tứ hóa đi theo can của năm; mỗi can một bộ bốn sao.',
  ],
  'tuan-va-triet': () =>
    Array.from({ length: CAN_COUNT }, (_, can) => {
      const triet = anTriet(can);
      return `Can ${CAN_NAMES[can]}: Triệt ở ${CHI[triet[0]]}, ${CHI[triet[1]]}.`;
    }),
  'cach-xem-dai-van': () => [
    `Tuổi khởi đại vận theo cục: ${NGU_HANH_ORDER.map((hanh) => `${CUC_BY_ELEMENT[hanh].name} khởi tuổi ${CUC_BY_ELEMENT[hanh].value}`).join(', ')}.`,
    'Mỗi vận mười năm, đọc như một cung.',
  ],
  'tieu-van-hang-nam': () =>
    TAM_HOP_GROUP_CHIS.map((chi) => {
      const group = [chi, (chi + 4) % 12, (chi + 8) % 12].map((index) => CHI[index]).join(' ');
      const start = CHI[anTieuHan(chi, Gender.Nam, 1)];
      return `Tuổi ${group}: tiểu hạn khởi ở ${start}, nam đi thuận, nữ đi nghịch.`;
    }),
  'sao-thai-tue': () => [`Các sao lưu niên: ${LUU_TINH_NAMES.join(', ')}.`],
  'ung-dung-tu-vi-cong-viec': () => [],
  'phong-thuy-va-tu-vi': () => [],
  'doc-la-so-cua-chinh-ban': doiLaSoLines,
};

export function lessonFactLines(lesson: PlannedLesson): readonly string[] {
  const build = BY_SLUG[lesson.slug];
  return build === undefined ? [] : build();
}
