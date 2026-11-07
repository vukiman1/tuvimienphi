import { CHI, ThaiTueRelation } from '@org/shared-tu-vi';

export const TAM_TAI_ORDINALS: Readonly<Record<1 | 2 | 3, string>> = {
  1: 'thứ nhất',
  2: 'thứ hai',
  3: 'thứ ba',
};

const THAI_TUE_LABELS: Readonly<Record<ThaiTueRelation, string>> = {
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

export function thaiTueRelationsLabel(relations: readonly ThaiTueRelation[]): string {
  return joinVietnamese(relations.map((relation) => THAI_TUE_LABELS[relation]));
}

export function chiNamesLabel(chiIndexes: readonly number[]): string {
  return joinVietnamese(chiIndexes.map((chi) => CHI[chi]));
}
