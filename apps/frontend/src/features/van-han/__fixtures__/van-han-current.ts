import type { VanHanCurrent, VanHanEntry } from '@org/shared-contracts';

export const TY_ENTRY: VanHanEntry = {
  zodiac: 'Tý',
  zodiacOrder: 1,
  year: 2026,
  title: 'Vận hạn tuổi Tý năm Bính Ngọ 2026',
  bornYears: [1972, 1984, 1996, 2008, 2020],
  luuNien:
    'Người tuổi Tý bước vào năm 2026 Bính Ngọ với vận trình nhiều chuyển biến, vừa có quý nhân nâng đỡ, vừa phải đối diện không ít thử thách đòi hỏi sự bền bỉ và tỉnh táo trong từng quyết định lớn nhỏ.\nNăm nay, tuổi Tý nên chú trọng sức khỏe.',
  luanGiai: [{ aspect: 'Công danh', rating: 4, body: 'Công việc có bước tiến. Nên giữ nhịp đều.' }],
  tungTuoi: [
    {
      birthYear: 1984,
      canChi: 'Giáp Tý',
      menh: 'Hải Trung Kim',
      male: 'Nam mạng gặp sao Kế Đô.',
      female: 'Nữ mạng gặp sao Thái Dương.',
    },
  ],
};

export const VAN_HAN_CURRENT: VanHanCurrent = { year: 2026, entries: [TY_ENTRY] };
