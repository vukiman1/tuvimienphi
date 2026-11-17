import { EntryGroup } from '@org/shared-contracts';
import {
  KIEN_THUC_ENTRIES,
  lessonsOfStep,
  type PlannedEntry,
  type PlannedPage,
} from '@org/shared-kien-thuc';

export enum KienThucBatch {
  Step01 = 'step-01',
  Step02 = 'step-02',
  Step03 = 'step-03',
  Step04 = 'step-04',
  Step05 = 'step-05',
  Step06 = 'step-06',
  ChinhTinh1 = 'chinh-tinh-1',
  ChinhTinh2 = 'chinh-tinh-2',
  Cung = 'cung',
  TuHoa = 'tu-hoa',
  PhuTinh = 'phu-tinh',
  NguHanh = 'ngu-hanh',
  ThuatNgu = 'thuat-ngu',
}

const CHINH_TINH_LOT_SIZE = 7;
const STEP_BATCHES: Readonly<Record<string, number>> = {
  [KienThucBatch.Step01]: 1,
  [KienThucBatch.Step02]: 2,
  [KienThucBatch.Step03]: 3,
  [KienThucBatch.Step04]: 4,
  [KienThucBatch.Step05]: 5,
  [KienThucBatch.Step06]: 6,
};

function entriesOfGroup(group: EntryGroup): readonly PlannedEntry[] {
  return KIEN_THUC_ENTRIES.filter((entry) => entry.group === group);
}

export function pagesOfBatch(batch: KienThucBatch): readonly PlannedPage[] {
  const step = STEP_BATCHES[batch];
  if (step !== undefined) return lessonsOfStep(step);
  switch (batch) {
    case KienThucBatch.ChinhTinh1:
      return entriesOfGroup(EntryGroup.ChinhTinh).slice(0, CHINH_TINH_LOT_SIZE);
    case KienThucBatch.ChinhTinh2:
      return entriesOfGroup(EntryGroup.ChinhTinh).slice(CHINH_TINH_LOT_SIZE);
    case KienThucBatch.Cung:
      return entriesOfGroup(EntryGroup.Cung);
    case KienThucBatch.TuHoa:
      return entriesOfGroup(EntryGroup.TuHoa);
    case KienThucBatch.PhuTinh:
      return entriesOfGroup(EntryGroup.PhuTinh);
    case KienThucBatch.NguHanh:
      return entriesOfGroup(EntryGroup.NguHanh);
    case KienThucBatch.ThuatNgu:
      return entriesOfGroup(EntryGroup.ThuatNgu);
    default:
      return [];
  }
}

export function isKienThucBatch(value: string): value is KienThucBatch {
  return (Object.values(KienThucBatch) as string[]).includes(value);
}

export function allBatches(): readonly KienThucBatch[] {
  return Object.values(KienThucBatch);
}
