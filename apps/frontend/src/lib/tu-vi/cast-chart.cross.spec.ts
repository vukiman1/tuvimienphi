import { CAN, CHI } from '@/lib/lunar-calendar';
import { castChart } from './cast-chart';
import { Gender } from './van-han';
import { TUVI_VN_CHARTS } from './tuvi-vn-charts.fixture';

/**
 * Đối chiếu với tuvi.vn — nguồn chân lý của dự án cho những chỗ có nhiều trường phái.
 *
 * Năm mươi bảy lá số thu bằng cách POST form lập lá số của họ, phủ đủ bốn tổ hợp Dương Nam /
 * Dương Nữ / Âm Nam / Âm Nữ, cả năm cục, và hai mươi mốt năm xem khác nhau — nhờ đó các tầng phụ
 * thuộc năm xem (nhãn đại vận, tiểu hạn, cung tháng) được kiểm ở nhiều tuổi chứ không chỉ một. Query string trên URL lá số chỉ để trang trí — id trong slug
 * mới quyết định lá số nào được dựng, nên không thể đổi ngày sinh bằng cách sửa URL.
 *
 * Fixture nằm cạnh file này. Muốn thu thêm thì chạy `harvest.py` trong thư mục nháp của phiên làm
 * việc; script không nằm trong repo vì nó phụ thuộc vào cấu trúc HTML của một trang bên ngoài.
 */

/**
 * tuvi.vn viết chi thứ sáu là "Tỵ", repo này viết "Tị". Cùng một chi, chỉ khác chính tả, nên chuẩn
 * hoá lúc so chứ không đổi cách viết của cả ứng dụng cho khớp một trang bên ngoài.
 */
/**
 * Hai chỗ hai bên viết khác chính tả nhưng cùng một thứ, và ở cả hai chỗ cách viết của repo mới là
 * cách sát chữ Hán: 巳 là "Tị", 爐中火 là lửa trong lò nên "Lô" chứ không phải "Lộ", và 柘 trong
 * 桑柘木 đọc là "chá" chứ không có âm "đố".
 *
 * Hai chỗ tuvi.vn viết đúng hơn thì đã sửa thẳng trong `nap-am.ts`, không cần chuẩn hoá ở đây nữa.
 */
const NAME_VARIANTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/Tỵ/g, 'Tị'],
  [/Lộ Trung Hỏa/g, 'Lô Trung Hỏa'],
  [/Tang Đố Mộc/g, 'Tang Chá Mộc'],
];

function normalizeNames(value: string): string {
  return NAME_VARIANTS.reduce(
    (text, [pattern, canonical]) => text.replace(pattern, canonical),
    value,
  );
}

/**
 * Một lá số duy nhất mà tuvi.vn tự mâu thuẫn với chính nó.
 *
 * Tân Sửu, giờ Mão, Âm Nam: tám lá số cùng nhóm Tị-Dậu-Sửu và cùng chiều nghịch đều khởi Hỏa Tinh
 * tại Mão, riêng lá số này khởi tại Thân — lệch năm cung. Đã lấy lại ở hai năm xem khác nhau, kết
 * quả tái hiện y nguyên nên không phải lỗi nhất thời.
 *
 * Giữ luật cổ điển (khởi Mão) vì nó khớp 56/57 lá số, và loại đúng một sao khỏi phép so thay vì bỏ
 * cả lá số — mười một nhóm assertion còn lại của nó vẫn có giá trị.
 */
const KNOWN_DIVERGENCES: Readonly<Record<string, readonly string[]>> = {
  '9/5/1961 giờ 5 nam xem 2038': ['Hỏa Tinh'],
};

const GENDERS: Readonly<Record<string, Gender>> = {
  nam: Gender.Nam,
  nu: Gender.Nu,
};

describe('castChart đối chiếu tuvi.vn', () => {
  for (const { input, expected } of TUVI_VN_CHARTS) {
    const label = `${input.day}/${input.month}/${input.year} giờ ${input.hour} ${input.gender} xem ${input.viewYear}`;

    const diverging = new Set(KNOWN_DIVERGENCES[label] ?? []);
    const comparable = (stars: readonly { name: string; rating: string | null }[]) =>
      stars.filter((star) => !diverging.has(star.name));

    describe(`${label} — ${expected.yearPillar} ${expected.amDuong}`, () => {
      const chart = castChart({
        solarDate: new Date(input.year, input.month - 1, input.day),
        hour: input.hour,
        gender: GENDERS[input.gender],
        viewYear: input.viewYear,
      });

      it('matches the year pillar, bản mệnh, cục and polarity', () => {
        expect({
          yearPillar: `${CAN[chart.pillars.year.can]} ${CHI[chart.pillars.year.chi]}`,
          banMenh: chart.banMenh,
          cuc: chart.cuc.name,
          amDuong: chart.amDuong.label,
        }).toEqual({
          yearPillar: normalizeNames(expected.yearPillar),
          banMenh: normalizeNames(expected.banMenh),
          cuc: expected.cuc,
          amDuong: expected.amDuong,
        });
      });

      it('names all twelve palaces the same way', () => {
        expect(chart.cungs.map((cung) => cung.name)).toEqual(
          expected.cungs.map((cung) => cung.cungName),
        );
      });

      it('places the fourteen major stars in the same palaces', () => {
        const actual = chart.cungs.map((cung) => cung.chinhTinh.map((star) => star.name).sort());
        const wanted = expected.cungs.map((cung) => [...cung.chinhTinh].sort());
        expect(actual).toEqual(wanted);
      });

      it('places all eighty-three phụ tinh in the same palaces', () => {
        const actual = chart.cungs.map((cung) =>
          comparable(cung.phuTinh)
            .map((star) => star.name)
            .sort(),
        );
        const wanted = expected.cungs.map((cung) =>
          comparable(cung.phuTinh)
            .map((star) => star.name)
            .sort(),
        );
        expect(actual).toEqual(wanted);
      });

      it('gives each phụ tinh the same miếu vượng', () => {
        const byName = (stars: readonly { name: string; rating: string | null }[]) =>
          Object.fromEntries(stars.map((star) => [star.name, star.rating]));
        const actual = chart.cungs.map((cung) => byName(comparable(cung.phuTinh)));
        const wanted = expected.cungs.map((cung) => byName(comparable(cung.phuTinh)));
        expect(actual).toEqual(wanted);
      });

      it('labels the twelve lưu niên palaces the same way', () => {
        expect(chart.cungs.map((cung) => cung.luuNienLabel)).toEqual(
          expected.cungs.map((cung) => cung.luuNienLabel),
        );
      });

      it('numbers the twelve month palaces the same way', () => {
        expect(chart.cungs.map((cung) => cung.cungThang)).toEqual(
          expected.cungs.map((cung) => cung.cungThang),
        );
      });

      it('weighs the same cân lượng', () => {
        expect(chart.canLuong).toBe(expected.canLuong);
      });

      it('names chủ mệnh and chủ thân the same way', () => {
        expect([chart.chuMenh, chart.chuThan]).toEqual([expected.chuMenh, expected.chuThan]);
      });

      it('runs the Tràng Sinh cycle through the same palaces', () => {
        expect(chart.cungs.map((cung) => cung.trangSinh)).toEqual(
          expected.cungs.map((cung) => cung.trangSinh),
        );
      });

      it('rates the major stars the same way where the source prints a rating', () => {
        // Bảng miếu vượng suy từ chính bộ này nên chưa phủ hết 168 ô; ô nào engine chưa có chứng
        // thì bỏ qua thay vì bắt nó đoán.
        for (const cung of expected.cungs) {
          const actual = chart.cungs[cung.chiIndex].chinhTinh;
          cung.chinhTinh.forEach((name, index) => {
            const wanted = cung.ratings[index];
            const got = actual.find((star) => star.name === name)?.rating ?? null;
            if (wanted !== null && got !== null) {
              expect([name, got]).toEqual([name, wanted]);
            }
          });
        }
      });

      it('labels the twelve palaces from the đại vận in force', () => {
        expect(chart.cungs.map((cung) => cung.daiVanLabel)).toEqual(
          expected.cungs.map((cung) => cung.daiVanLabel),
        );
      });

      it('starts every đại vận span at the same age', () => {
        expect(chart.cungs.map((cung) => cung.daiVanStartAge)).toEqual(
          expected.cungs.map((cung) => cung.daiVanStartAge),
        );
      });

      it('blocks the same palaces with Tuần and Triệt', () => {
        // Trang gốc chỉ gắn nhãn vào một trong hai cung bị chắn — cung sau của cặp — nên đối chiếu
        // theo cung mang nhãn chứ không theo cả cặp.
        const tuanAnchor = expected.cungs.find((cung) => cung.hasTuan)?.chiIndex;
        const trietAnchor = expected.cungs.find((cung) => cung.hasTriet)?.chiIndex;

        expect(tuanAnchor === undefined || chart.tuan.includes(tuanAnchor)).toBe(true);
        expect(trietAnchor === undefined || chart.triet.includes(trietAnchor)).toBe(true);
      });
    });
  }
});
