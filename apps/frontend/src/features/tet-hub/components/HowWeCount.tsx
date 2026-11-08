import type { ReactElement } from 'react';
import {
  BAT_HAN_TRUYEN_THONG,
  HOANG_OC_TRUYEN_THONG,
  KIM_LAU_TRUYEN_THONG,
  TAM_TAI_TRUYEN_THONG,
  XONG_DAT_TRUYEN_THONG,
} from '@org/shared-tu-vi';

const HOW_WE_COUNT_TITLE_ID = 'how-we-count-title';

interface MethodNote {
  readonly label: string;
  readonly text: string;
}

const METHOD_NOTES: readonly MethodNote[] = [
  {
    label: 'Tuổi âm',
    text: 'Tuổi trên trang là tuổi âm, tức tuổi mụ: tính cả năm nằm trong bụng mẹ, nên bằng năm xem trừ năm sinh rồi cộng thêm một.',
  },
  {
    label: 'Năm sinh',
    text: 'Năm sinh là năm âm lịch. Người sinh trước Tết Nguyên đán thuộc năm âm lịch trước đó, nên ai sinh vào tháng Một hay tháng Hai dương lịch mà chưa qua Tết thì xem trang của năm trước.',
  },
  {
    label: 'Nguồn',
    text: 'Các bảng theo cách tính bằng tuổi mụ phổ biến trong dân gian Việt Nam. Sao chiếu mệnh và hạn được đối chiếu với bảng sao hạn của dienmayxanh.com và quantrimang.com, Hoang ốc với dienmayxanh.com và wiki.batdongsan.com.vn. Chỗ nào các nguồn ghi khác nhau, chúng tôi theo cách được nhiều nguồn dùng hơn.',
  },
  { label: 'Hạn', text: BAT_HAN_TRUYEN_THONG },
  { label: 'Hoang ốc', text: HOANG_OC_TRUYEN_THONG },
  { label: 'Kim lâu', text: KIM_LAU_TRUYEN_THONG },
  { label: 'Tam tai', text: TAM_TAI_TRUYEN_THONG },
  { label: 'Xông đất', text: XONG_DAT_TRUYEN_THONG },
  {
    label: 'Tam tai, Thái tuế, xông đất',
    text: 'Ba điều này chỉ phụ thuộc con giáp, nên mọi năm sinh cùng một con giáp có chung kết luận.',
  },
];

export function HowWeCount(): ReactElement {
  return (
    <section
      aria-labelledby={HOW_WE_COUNT_TITLE_ID}
      className="rounded-2xl border border-[#e7d9bf] bg-card px-6 py-5"
    >
      <h2 id={HOW_WE_COUNT_TITLE_ID} className="text-[18px] font-semibold text-[#2a1f0e]">
        Cách chúng tôi tính
      </h2>
      <dl className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-[#3b2d18]">
        {METHOD_NOTES.map(({ label, text }) => (
          <div key={label}>
            <dt className="font-semibold text-[#2a1f0e]">{label}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
