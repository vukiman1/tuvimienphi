import {
  anTuHoa,
  CHI_COUNT,
  CHINH_TINH_NAMES,
  CHINH_TINH_NGU_HANH,
  chinhTinhChom,
  ChinhTinhChom,
  HOA_NAMES,
  isHungTinh,
  PHU_TINH_NGU_HANH,
  phuTinhRatingOf,
  ratingOf,
} from '@org/shared-tu-vi';
import type {
  ChinhTinhName,
  HoaName,
  NguHanh,
  PhuTinhName,
  Rating,
  SaoName,
} from '@org/shared-tu-vi';

export enum SaoKind {
  ChinhTinh = 'chinh-tinh',
  PhuTinh = 'phu-tinh',
  TuHoa = 'tu-hoa',
}

export interface SaoRatingCell {
  readonly chi: number;
  readonly rating: Rating;
}

interface SaoFactsBase {
  readonly name: SaoName;
  readonly hanh: NguHanh;
  readonly ratings: readonly SaoRatingCell[];
}

export interface ChinhTinhFacts extends SaoFactsBase {
  readonly kind: SaoKind.ChinhTinh;
  readonly name: ChinhTinhName;
  readonly chom: ChinhTinhChom;
}

export interface PhuTinhFacts extends SaoFactsBase {
  readonly kind: SaoKind.PhuTinh;
  readonly name: PhuTinhName;
  readonly isHung: boolean;
}

export interface TuHoaByCan {
  readonly can: number;
  readonly star: SaoName;
}

export interface TuHoaFacts extends SaoFactsBase {
  readonly kind: SaoKind.TuHoa;
  readonly name: HoaName;
  readonly isHung: boolean;
  readonly byCan: readonly TuHoaByCan[];
}

export type SaoFacts = ChinhTinhFacts | PhuTinhFacts | TuHoaFacts;

const CAN_COUNT = 10;

const CHINH_TINH_SET: ReadonlySet<string> = new Set(CHINH_TINH_NAMES);
const HOA_SET: ReadonlySet<string> = new Set(HOA_NAMES);

function isChinhTinhName(name: SaoName): name is ChinhTinhName {
  return CHINH_TINH_SET.has(name);
}

function isHoaName(name: SaoName): name is HoaName {
  return HOA_SET.has(name);
}

export function ratingAt(name: SaoName, chi: number): Rating | null {
  return isChinhTinhName(name) ? ratingOf(name, chi) : phuTinhRatingOf(name, chi);
}

function chinhTinhRatings(name: ChinhTinhName): readonly SaoRatingCell[] {
  const cells: SaoRatingCell[] = [];
  for (let chi = 0; chi < CHI_COUNT; chi += 1) {
    cells.push({ chi, rating: ratingOf(name, chi) });
  }
  return cells;
}

function phuTinhRatings(name: PhuTinhName): readonly SaoRatingCell[] {
  const cells: SaoRatingCell[] = [];
  for (let chi = 0; chi < CHI_COUNT; chi += 1) {
    const rating = phuTinhRatingOf(name, chi);
    if (rating !== null) {
      cells.push({ chi, rating });
    }
  }
  return cells;
}

function tuHoaByCan(name: HoaName): readonly TuHoaByCan[] {
  const rows: TuHoaByCan[] = [];
  for (let can = 0; can < CAN_COUNT; can += 1) {
    const match = anTuHoa(can).find((tuHoa) => tuHoa.hoa === name);
    if (match) {
      rows.push({ can, star: match.star });
    }
  }
  return rows;
}

export function saoFacts(name: SaoName): SaoFacts {
  if (isHoaName(name)) {
    return {
      kind: SaoKind.TuHoa,
      name,
      hanh: PHU_TINH_NGU_HANH[name],
      ratings: phuTinhRatings(name),
      isHung: isHungTinh(name),
      byCan: tuHoaByCan(name),
    };
  }
  if (isChinhTinhName(name)) {
    return {
      kind: SaoKind.ChinhTinh,
      name,
      hanh: CHINH_TINH_NGU_HANH[name],
      ratings: chinhTinhRatings(name),
      chom: chinhTinhChom(name),
    };
  }
  return {
    kind: SaoKind.PhuTinh,
    name,
    hanh: PHU_TINH_NGU_HANH[name],
    ratings: phuTinhRatings(name),
    isHung: isHungTinh(name),
  };
}
