import { CHI, ThaiTueRelation, getYearCanChi, type TuoiNamFacts } from '@org/shared-tu-vi';

export const TAM_TAI_ORDINALS: Readonly<Record<1 | 2 | 3, string>> = {
  1: 'thứ nhất',
  2: 'thứ hai',
  3: 'thứ ba',
};

export const THAI_TUE_LABELS: Readonly<Record<ThaiTueRelation, string>> = {
  [ThaiTueRelation.Truc]: 'trực (năm tuổi)',
  [ThaiTueRelation.Xung]: 'xung',
  [ThaiTueRelation.Hinh]: 'hình',
  [ThaiTueRelation.Hai]: 'hại',
  [ThaiTueRelation.Pha]: 'phá',
};

const LIST_SEPARATOR = ', ';
const LAST_LIST_SEPARATOR = ' và ';

function joinVietnamese(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(LIST_SEPARATOR)}${LAST_LIST_SEPARATOR}${items[items.length - 1]}`;
}

function chiNames(chiIndexes: readonly number[]): string {
  return joinVietnamese(chiIndexes.map((chi) => CHI[chi]));
}

export function tamTaiVerdict(facts: TuoiNamFacts): string {
  const chi = CHI[facts.chi];
  if (facts.tamTai === null) {
    return `Tuổi ${chi} không phạm Tam tai trong năm ${facts.viewYear}.`;
  }
  return `Năm ${facts.viewYear} là năm ${TAM_TAI_ORDINALS[facts.tamTai]} trong ba năm Tam tai liên tiếp của tuổi ${chi}. Dân gian khuyên giữ nhịp sống chừng mực và cân nhắc kỹ trước khi khởi sự việc lớn.`;
}

export function thaiTueVerdict(facts: TuoiNamFacts): string {
  const chi = CHI[facts.chi];
  const year = `năm ${getYearCanChi(facts.viewYear)} ${facts.viewYear}`;
  if (facts.thaiTue.length === 0) {
    return `Tuổi ${chi} không phạm Thái tuế ${year}.`;
  }
  const relations = joinVietnamese(facts.thaiTue.map((relation) => THAI_TUE_LABELS[relation]));
  return `Tuổi ${chi} phạm Thái tuế ${year} theo thế ${relations}. Dân gian khuyên năm này làm việc gì cũng nên thong thả và giữ hòa khí.`;
}

export function xongDatVerdict(facts: TuoiNamFacts): string {
  const chi = CHI[facts.chi];
  const tet = `Tết ${getYearCanChi(facts.viewYear)} ${facts.viewYear}`;
  const tranh = `nên tránh người tuổi ${chiNames(facts.xongDat.tranh)}`;
  if (facts.xongDat.hop.length === 0) {
    return `${tet}, không có tuổi tam hợp hay lục hợp nào vừa hợp gia chủ tuổi ${chi} vừa hợp năm mới; ${tranh} xông đất.`;
  }
  return `${tet}, gia chủ tuổi ${chi} hợp người tuổi ${chiNames(facts.xongDat.hop)} xông đất, ${tranh}.`;
}
