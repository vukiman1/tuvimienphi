import {
  CAN,
  CHI,
  CHI_NGU_HANH,
  CUC_BY_ELEMENT,
  CUNG_NAMES,
  tamHopIndexes,
  VONG_TRANG_SINH,
  xungChieuIndex,
  type NguHanh,
} from '@org/shared-tu-vi';
import type { PlannedTermEntry } from '@org/shared-kien-thuc';
import { NGU_HANH_ORDER } from './ngu-hanh-order';

function chiOfHanh(hanh: NguHanh): readonly string[] {
  return CHI.filter((_, index) => CHI_NGU_HANH[index] === hanh);
}

function tamHopGroups(): readonly string[] {
  const seen = new Set<number>();
  const groups: string[] = [];
  for (let index = 0; index < CHI.length; index += 1) {
    if (seen.has(index)) continue;
    const members = [index, ...tamHopIndexes(index)];
    members.forEach((member) => seen.add(member));
    groups.push(members.map((member) => CHI[member]).join(' '));
  }
  return groups;
}

function lucXungPairs(): readonly string[] {
  const pairs: string[] = [];
  for (let index = 0; index < CHI.length / 2; index += 1) {
    pairs.push(`${CHI[index]}–${CHI[xungChieuIndex(index)]}`);
  }
  return pairs;
}

function hanhLines(hanh: NguHanh): readonly string[] {
  return [
    `Hành ${hanh}.`,
    `Chi thuộc hành ${hanh}: ${chiOfHanh(hanh).join(', ')}.`,
    `Cục của hành ${hanh}: ${CUC_BY_ELEMENT[hanh].name}.`,
  ];
}

const BY_SLUG: Readonly<Record<string, () => readonly string[]>> = {
  can: () => [`Mười thiên can: ${CAN.join(', ')}.`],
  chi: () => [`Mười hai địa chi: ${CHI.join(', ')}.`],
  cuc: () => [
    `Năm cục: ${NGU_HANH_ORDER.map((hanh) => `${CUC_BY_ELEMENT[hanh].name} (${CUC_BY_ELEMENT[hanh].value})`).join(', ')}.`,
  ],
  'vong-trang-sinh': () => [`Vòng Tràng Sinh mười hai sao: ${VONG_TRANG_SINH.join(', ')}.`],
  'tam-hop-luc-xung': () => [
    `Bốn nhóm tam hợp: ${tamHopGroups().join('; ')}.`,
    `Sáu cặp lục xung: ${lucXungPairs().join(', ')}.`,
  ],
  'lai-nhan-cung': () => [`Cung mang can trùng can năm sinh, đọc trong ${CUNG_NAMES.length} cung.`],
};

export function termRequiredMentions(entry: PlannedTermEntry): readonly string[] {
  return [entry.title];
}

export function termBriefLines(entry: PlannedTermEntry): readonly string[] {
  if (entry.hanh !== null) return hanhLines(entry.hanh);
  const build = BY_SLUG[entry.slug];
  if (build !== undefined) return build();
  return [`Thuật ngữ "${entry.title}"; giải thích ngắn gọn cho người mới.`];
}
