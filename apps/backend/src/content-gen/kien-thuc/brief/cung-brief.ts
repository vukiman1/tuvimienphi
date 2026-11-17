import { CUNG_NAMES, type CungName } from '@org/shared-tu-vi';
import { cungRelations } from '@org/shared-kien-thuc';

export function cungRequiredMentions(cung: CungName): readonly string[] {
  const relations = cungRelations(cung);
  return [cung, relations.doiCung, relations.tamHop[0], relations.tamHop[1]];
}

export function cungBriefLines(cung: CungName): readonly string[] {
  const relations = cungRelations(cung);
  const position = CUNG_NAMES.indexOf(cung) + 1;
  return [
    `Vị trí: cung thứ ${position} tính thuận từ Mệnh.`,
    `Đối cung: ${relations.doiCung}.`,
    `Tam hợp: ${relations.tamHop[0]} và ${relations.tamHop[1]}.`,
  ];
}
