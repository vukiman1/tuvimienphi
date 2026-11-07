import { CHI, getYearCanChi, type TuoiNamFacts } from '@org/shared-tu-vi';
import { TAM_TAI_ORDINALS, chiNamesLabel, thaiTueRelationsLabel } from './tuoi-nam-labels';

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
  const relations = thaiTueRelationsLabel(facts.thaiTue);
  return `Tuổi ${chi} phạm Thái tuế ${year} theo thế ${relations}. Dân gian khuyên năm này làm việc gì cũng nên thong thả và giữ hòa khí.`;
}

export function xongDatVerdict(facts: TuoiNamFacts): string {
  const chi = CHI[facts.chi];
  const tet = `Tết ${getYearCanChi(facts.viewYear)} ${facts.viewYear}`;
  const tranh = `nên tránh người tuổi ${chiNamesLabel(facts.xongDat.tranh)}`;
  if (facts.xongDat.hop.length === 0) {
    return `${tet}, không có tuổi tam hợp hay lục hợp nào vừa hợp gia chủ tuổi ${chi} vừa hợp năm mới; ${tranh} xông đất.`;
  }
  return `${tet}, gia chủ tuổi ${chi} hợp người tuổi ${chiNamesLabel(facts.xongDat.hop)} xông đất, ${tranh}.`;
}
