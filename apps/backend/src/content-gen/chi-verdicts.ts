import {
  TAM_TAI_ORDINALS,
  TAM_TAI_YEARS,
  ThaiTueRelation,
  type TamTaiNamThu,
} from '@org/shared-tu-vi';
import { affirms, mentions } from './check-text';

export interface ChiVerdicts {
  readonly tamTai: TamTaiNamThu | null;
  readonly thaiTue: readonly ThaiTueRelation[];
}

export const NO_TAM_TAI_KEYWORD = 'không phạm Tam tai';
export const NO_THAI_TUE_KEYWORD = 'không phạm Thái tuế';
export const THAI_TUE_SUFFIX = 'Thái tuế';

const THAI_TUE_RELATIONS: readonly ThaiTueRelation[] = Object.values(ThaiTueRelation);

export function tamTaiKeyword(year: TamTaiNamThu): string {
  return `năm ${TAM_TAI_ORDINALS[year]} của Tam tai`;
}

export function thaiTueKeyword(relation: ThaiTueRelation): string {
  return `${relation} ${THAI_TUE_SUFFIX}`;
}

export function checkTamTai(text: string, { tamTai }: ChiVerdicts): string[] {
  const wrongYears = TAM_TAI_YEARS.filter((year) => year !== tamTai)
    .filter((year) => affirms(text, [tamTaiKeyword(year)]))
    .map((year) =>
      tamTai === null
        ? `nhắc "${tamTaiKeyword(year)}" nhưng dữ kiện tính tuổi này không phạm Tam tai`
        : `nhắc "${tamTaiKeyword(year)}" nhưng dữ kiện tính tuổi này ở ${tamTaiKeyword(tamTai)}`,
    );
  const denial =
    tamTai !== null && mentions(text, NO_TAM_TAI_KEYWORD)
      ? [`nói "${NO_TAM_TAI_KEYWORD}" nhưng dữ kiện tính tuổi này ở ${tamTaiKeyword(tamTai)}`]
      : [];
  return [...denial, ...wrongYears];
}

export function checkThaiTue(text: string, { thaiTue }: ChiVerdicts): string[] {
  const wrongRelations = THAI_TUE_RELATIONS.filter((relation) => !thaiTue.includes(relation))
    .filter((relation) => affirms(text, [thaiTueKeyword(relation)]))
    .map((relation) => `nhắc "${thaiTueKeyword(relation)}" mà dữ kiện không tính cho tuổi này`);
  const denial =
    thaiTue.length > 0 && mentions(text, NO_THAI_TUE_KEYWORD)
      ? [`nói "${NO_THAI_TUE_KEYWORD}" nhưng dữ kiện tính tuổi này có phạm Thái tuế`]
      : [];
  return [...denial, ...wrongRelations];
}
