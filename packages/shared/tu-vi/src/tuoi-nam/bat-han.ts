import { Gender } from '../van-han.js';

export const BAT_HAN = [
  'Huỳnh Tuyền',
  'Tam Kheo',
  'Ngũ Mộ',
  'Thiên Tinh',
  'Tán Tận',
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
    'Tán Tận',
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
  'Theo cách đếm phổ biến, mỗi chín tuổi mụ là một chặng đi hết tám hạn, nam bắt đầu từ Huỳnh Tuyền và nữ từ Tán Tận, một hạn được đếm hai năm liên tiếp và hạn đó dời sang hạn kế tiếp sau mỗi chặng, hết bảy mươi hai tuổi thì quay lại từ đầu.';

export function batHan(tuoi: number, gender: Gender): BatHan {
  const ageInCycle = tuoi % AGES_PER_CYCLE;
  const block = Math.floor(ageInCycle / AGES_PER_BLOCK);
  const position = ageInCycle % AGES_PER_BLOCK;
  const doubledIndex = (block + BLOCKS_PER_CYCLE - 1) % BLOCKS_PER_CYCLE;
  const orderIndex = position <= doubledIndex ? position : position - 1;
  return BAT_HAN_ORDER_BY_GENDER[gender][orderIndex];
}
