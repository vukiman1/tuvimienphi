import { ContentKind, EntryGroup } from '@org/shared-contracts';
import {
  anCungMenh,
  anCungThan,
  anTieuHan,
  anTriet,
  CAN,
  CHI,
  CHI_NGU_HANH,
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
  phamThaiTue,
  ThaiTueRelation,
  type CungName,
  type SaoName,
} from '@org/shared-tu-vi';
import {
  castSampleChart,
  KIEN_THUC_ENTRIES,
  saoFacts,
  SaoKind,
  type PlannedLesson,
} from '@org/shared-kien-thuc';
import { NGU_HANH_ORDER } from './ngu-hanh-order';

const MONTHS = 12;
const HOURS = 12;
const SINH_CYCLE = 'Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim, Kim sinh Thủy, Thủy sinh Mộc.';
const KHAC_CYCLE = 'Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc.';
const TAM_HOP_GROUP_CHIS = [8, 2, 5, 11];
const THAI_TUE_EXAMPLE_CHI = 'Ngọ';
const THIEN_BAN_ROWS = [
  'Họ tên',
  'Năm, Tháng, Ngày, Giờ sinh, mỗi dòng ghi cả dương lịch và âm lịch',
  'Năm xem',
  'Âm dương',
  'Bản mệnh',
  'Cân lượng',
  'Chủ mệnh',
  'Chủ thân',
  'Lai nhân cung',
] as const;

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

function chiPairsWith(relation: ThaiTueRelation): readonly string[] {
  const pairs: string[] = [];
  for (let first = 0; first < CHI.length; first += 1) {
    for (let second = first + 1; second < CHI.length; second += 1) {
      if (phamThaiTue(first, second).includes(relation))
        pairs.push(`${CHI[first]} và ${CHI[second]}`);
    }
  }
  return pairs;
}

function thaiTueLines(): readonly string[] {
  const tuHinh = CHI.filter((_, index) => phamThaiTue(index, index).includes(ThaiTueRelation.Hinh));
  const exampleChi = CHI.indexOf(THAI_TUE_EXAMPLE_CHI);
  const example = CHI.map((chi, index) => ({ chi, relations: phamThaiTue(index, exampleChi) }))
    .filter((row) => row.relations.length > 0)
    .map((row) => `tuổi ${row.chi}: ${row.relations.join(', ')}`);
  return [
    'Phạm Thái Tuế là khi chi năm sinh có một trong năm quan hệ với chi của năm đang xem.',
    `${ThaiTueRelation.Truc}: chi năm sinh trùng chi năm xem.`,
    `${ThaiTueRelation.Xung}: chi năm sinh đối chi năm xem, cách nhau sáu ô: ${chiPairsWith(ThaiTueRelation.Xung).join('; ')}.`,
    `${ThaiTueRelation.Hinh}: ${chiPairsWith(ThaiTueRelation.Hinh).join('; ')}; tự hình khi tuổi gặp năm cùng chi: ${tuHinh.join(', ')}.`,
    `${ThaiTueRelation.Hai}: ${chiPairsWith(ThaiTueRelation.Hai).join('; ')}.`,
    `${ThaiTueRelation.Pha}: ${chiPairsWith(ThaiTueRelation.Pha).join('; ')}.`,
    `Ví dụ năm có chi ${THAI_TUE_EXAMPLE_CHI}: ${example.join('; ')}.`,
  ];
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
    `Ô giữa của lá số trên trang này ghi theo thứ tự: ${THIEN_BAN_ROWS.join('; ')}.`,
    'Dòng Bản mệnh ghi cả bản mệnh lẫn cục, ví dụ "Kiếm Phong Kim - Kim Tứ Cục".',
  ],
  'am-duong-ngu-hanh-co-ban': () => [
    `Năm hành: ${NGU_HANH_ORDER.join(', ')}.`,
    `Vòng sinh: ${SINH_CYCLE}`,
    `Vòng khắc: ${KHAC_CYCLE}`,
    `Hành của một cung là hành của địa chi nơi cung đóng: ${CHI.map((chi, index) => `${chi} ${CHI_NGU_HANH[index]}`).join(', ')}.`,
    `Can năm sinh chia âm dương: ${CAN.filter((_, index) => index % 2 === 0).join(', ')} là dương; ${CAN.filter((_, index) => index % 2 === 1).join(', ')} là âm.`,
    'Dòng Âm dương ở ô giữa ghép âm dương của can năm sinh với giới tính: Dương Nam, Âm Nam, Dương Nữ, Âm Nữ.',
    'Dương Nam và Âm Nữ thì đại vận đi thuận; Âm Nam và Dương Nữ thì đại vận đi nghịch.',
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
    CAN.map((name, can) => {
      const triet = anTriet(can);
      return `Can ${name}: Triệt ở ${CHI[triet[0]]}, ${CHI[triet[1]]}.`;
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
  'sao-thai-tue': () => [`Các sao lưu niên: ${LUU_TINH_NAMES.join(', ')}.`, ...thaiTueLines()],
  'ung-dung-tu-vi-cong-viec': () => [],
  'phong-thuy-va-tu-vi': () => [],
  'doc-la-so-cua-chinh-ban': doiLaSoLines,
};

export function lessonFactLines(lesson: PlannedLesson): readonly string[] {
  const build = BY_SLUG[lesson.slug];
  return build === undefined ? [] : build();
}
