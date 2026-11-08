import { Gender } from '../van-han.js';

export const BAT_HAN = [
  'Huỳnh Tuyền',
  'Tam Kheo',
  'Ngũ Mộ',
  'Thiên Tinh',
  'Toán Tận',
  'Thiên La',
  'Địa Võng',
  'Diêm Vương',
] as const;

export type BatHan = (typeof BAT_HAN)[number];

const AGES_PER_BLOCK = 9;
const BLOCKS_PER_CYCLE = 8;
const AGES_PER_CYCLE = AGES_PER_BLOCK * BLOCKS_PER_CYCLE;

const BAT_HAN_ORDER_BY_GENDER: Record<Gender, readonly BatHan[]> = {
  [Gender.Nam]: BAT_HAN,
  [Gender.Nu]: [
    'Toán Tận',
    'Thiên Tinh',
    'Ngũ Mộ',
    'Tam Kheo',
    'Huỳnh Tuyền',
    'Diêm Vương',
    'Địa Võng',
    'Thiên La',
  ],
};

export const BAT_HAN_TRUYEN_THONG =
  'Tuổi mụ chia thành từng chặng chín năm, mỗi chặng bắt đầu ở tuổi chia hết cho chín và đi qua tám hạn theo thứ tự, nam mở đầu bằng Huỳnh Tuyền còn nữ mở đầu bằng Toán Tận. Vì chín tuổi chỉ có tám hạn nên mỗi chặng có một hạn được tính hai năm liên tiếp, chặng đầu là hạn mở đầu, mỗi chặng sau chuyển sang hạn kế tiếp, và hết bảy mươi hai tuổi thì quay lại từ đầu.';

export function batHan(tuoi: number, gender: Gender): BatHan {
  const ageInCycle = tuoi % AGES_PER_CYCLE;
  const block = Math.floor(ageInCycle / AGES_PER_BLOCK);
  const position = ageInCycle % AGES_PER_BLOCK;
  const doubledIndex = (block + BLOCKS_PER_CYCLE - 1) % BLOCKS_PER_CYCLE;
  const orderIndex = position <= doubledIndex ? position : position - 1;
  return BAT_HAN_ORDER_BY_GENDER[gender][orderIndex];
}
