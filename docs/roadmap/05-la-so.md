# Lá Số

> Mục 1–3 và 5–8 đã xong; chi tiết giữ lại làm ngữ cảnh. **Chỉ còn mục 4** — 35 lưu tinh `L.*`,
> kẹt ở khâu thu dữ liệu chứ không phải khâu code.
> Luận giải và lưu lá số đẩy sang **phase sau**, gom ở cuối file.

Việc còn lại của trang `/la-so` và engine an sao trong [apps/frontend/src/lib/tu-vi/](../../apps/frontend/src/lib/tu-vi/).

Bối cảnh: engine đã đối chiếu khớp 81 lá số thật của tuvi.vn — 12 cung, 14 chính tinh, 83 phụ tinh,
miếu vượng cả chính lẫn phụ, Tuần, Triệt, tứ hoá, vòng Tràng Sinh, đại vận, tiểu hạn và cung tháng.
Luật an sao ghi ở [docs/algorithms/tu-vi-la-so.md](../algorithms/tu-vi-la-so.md).

---

## 1. ✅ Cho đổi năm xem

**Vấn đề:** [la-so-page.tsx](../../apps/frontend/src/features/la-so/pages/la-so-page.tsx) chốt cứng
`viewYear: new Date().getFullYear()`. Không có cách nào xem lá số ở một năm khác.

**Vì sao quan trọng:** ba tầng đổi theo năm xem — nhãn `ĐV.*`, cung tháng `Th.N` và cung tiểu hạn.
Người dùng đối chiếu với lá số cũ lập ở năm khác sẽ thấy lệch và tưởng là sai.

**Cách làm:**

- Thêm `viewYear` optional vào `birthSearchSchema` trong
  [birth-input.ts](../../apps/frontend/src/features/la-so/birth-input.ts), mặc định năm hiện tại.
- Một `<select>` năm trên thiên bàn, đổi năm thì `navigate` với search param mới.
- Chỉ tính lại nhãn vận hạn — sao gốc giữ nguyên, không dựng lại lá số.

**Acceptance:** `/la-so?...&viewYear=2023` ra `ĐV.MỆNH` ở Mùi và `Th.1` ở Hợi cho lá số
1/2/2002 giờ Tị; đổi năm trên giao diện cho cùng kết quả.

---

## 2. ✅ Bỏ lá số giả khi vào trang trần

**Vấn đề:** `la-so-page.tsx` fallback về `MOCK_CHART` khi search param không hợp lệ. Vào `/la-so`
không kèm gì sẽ thấy một lá số của người khác, trông như thật.

**Cách làm:** không có tham số hợp lệ thì hiện form nhập ngày sinh (tái dùng `heroBirthFieldSchemas`
của trang chủ), không hiện bàn. Xong thì xoá `mock-chart.ts` — nó chỉ còn phục vụ fallback này.

**Acceptance:** `/la-so` hiện form; nhập xong ra đúng lá số; `mock-chart.ts` không còn ai import.

---

## 3. ✅ Dấu âm dương của chính tinh

**Vấn đề:** `ChinhTinhView.polarity` luôn `null`. tuvi.vn in `+Thái Dương`, `−Thái Âm`.

**Cách làm:** bảng cố định 14 sao, cùng khuôn với `sao-ngu-hanh-data.ts`. Dữ liệu lấy được từ một lá
số bất kỳ.

| +   | Tử Vi · Thiên Đồng · Thái Dương · Thiên Lương · Thiên Tướng · Thất Sát                |
| --- | ------------------------------------------------------------------------------------- |
| −   | Thiên Cơ · Vũ Khúc · Liêm Trinh · Thiên Phủ · Thái Âm · Tham Lang · Cự Môn · Phá Quân |

**Acceptance:** cross-spec so cả dấu; ô cung in `+THÁI DƯƠNG (M)`.

---

## 4. ✅ ~~Nhãn lưu niên `LN.*`~~ · ~~lưu tinh `L.*`~~

**`LN.*` đã xong.** Mốc neo là **cung đại vận**, không phải địa bàn gốc — đó là lý do mọi phép dò
trước đều hỏng. Luật dò từ 57 lá số, kiểm trên 24 lá số giữ riêng: 81 lá số, 972 nhãn, không sai ô
nào. Chi tiết ở [tài liệu thuật toán](../algorithms/tu-vi-la-so.md).

**Lưu tinh cũng xong**, và hoá ra chưa bao giờ là bài toán dò luật — chỉ là **chưa từng có dữ liệu**.
Bộ harvest cũ đọc HTML nên không bắt được tầng này. tuvi.vn có sẵn một API lưu niên trả JSON
(`loadNamXem` POST tới endpoint lưu niên, trả `cung_model` kèm `id` là chỉ số chi và `type` phân
tầng sao) — sạch hơn scraping rất nhiều.

Cào 16 năm xem × 3 lá số. Kết quả:

- **Mười lăm sao dùng lại đúng bảng natal**, chỉ thay can chi năm sinh bằng can chi năm xem: Thái
  Tuế, Tang Môn, Bạch Hổ, Kiếp Sát, Thiên Mã, Đào Hoa, Hồng Loan, Thiên Khốc, Thiên Hư, Nguyệt Đức,
  Thiên Đức, Lộc Tồn, Kình Dương, Thiên Khôi, Thiên Việt. **16/16 năm xem, không một ô lệch.**
- **Văn Xương và Văn Khúc** cần bảng riêng theo can năm xem, vì tầng natal an chúng theo giờ sinh.
  Bảng ở [an-luu-tinh.ts](../../apps/frontend/src/lib/tu-vi/an-luu-tinh.ts), hai sao soi gương nhau.
  Bỏ trống ở can **Đinh** và **Mậu** vì tuvi.vn không an chúng ở những năm đó — đã kiểm bốn năm.
- **Ba lá số khác hẳn nhau cho kết quả trùng khít**, nên lưu tinh là hàm thuần của năm xem. Cài vào
  `applyViewYear`, không đụng `castNatal`.

Hai điều chỉnh so với mô tả cũ của mục này:

- Con số "35 lưu tinh" **sai**. Thực tế 17 sao thuộc tầng lưu niên, cộng một tầng khác hẳn ở mục 9.
- `L.Long Đức` và `L.Phúc Đức` trên tuvi.vn **không phải lưu tinh**: chúng đứng yên ở vị trí natal
  suốt 16 năm xem, tức trang gắn nhầm nhãn `L.` cho sao gốc. Đã bỏ khỏi tầng lưu để cùng một sao
  không in hai lần trong một cung.

---

## 5. ✅ ~~Cân lượng~~ · ~~lai nhân cung~~

**Vấn đề:** hai ô trống trên thiên bàn.

**Cân lượng đã xong** — chép bảng từ sách, sửa năm ô sai theo dữ liệu, khớp 57/57. Chi tiết ở
[docs/algorithms/tu-vi-la-so.md](../algorithms/tu-vi-la-so.md).

**Lai nhân cung cũng xong** — và không cần harvest lại lá số nào. Luật là **cung mang thiên can
trùng can năm sinh**, mà `canOfCung` đã có sẵn từ đầu.

Chỗ duy nhất phải dò là phá hoà: ngũ hổ độn khiến Tý luôn trùng can với Dần và Sửu luôn trùng với
Mão, nên tuổi Nhâm và tuổi Tân khớp hai cung. **Trùng thì lấy Tý/Sửu** — rút gọn thành "đếm xuôi từ
Tý, lấy cung khớp đầu tiên". Bảng đầy đủ ở [tài liệu thuật toán](../algorithms/tu-vi-la-so.md).

Đã thử luật _"Tý khai thiên, Sửu tích địa"_ của phái Khâm Thiên Tứ Hoá (Tân → Mão, Nhâm → Dần) rồi
**loại**: cả hai ca trùng đều được đối chiếu bằng lá số thật trên tuvi.vn và đều ngược lại.

- 1/2/2002 giờ Tị nam (Tân Tị) → trang ra **Nô Bộc**, tức cung Sửu
- 15/6/2002 giờ Ngọ nam (Nhâm Ngọ) → trang ra **Mệnh**, tức cung Tý

Cả mười can đều có chứng, không còn chỗ nào suy diễn.

---

## 6. ✅ Hai ô miếu vượng còn trống

Đã lấp: **Hỏa Tinh tại Mão = Đ**, **Linh Tinh tại Tị = Đ**. Tính ngược từ công thức xem ngày sinh nào
rơi vào đúng hai ô đó rồi harvest riêng hai lá số. Hai sao hoá ra có bảng bậc **giống hệt nhau** —
đắc ở Dần–Ngọ, hãm phần còn lại; hợp lý vì cả hai đều thuộc Hỏa.

Bảng chính tinh vẫn còn 14/168 ô trống, làm được theo đúng cách này.

---

## 7. ✅ Lỗi ở lớp bắc cầu engine ↔ giao diện

Engine đã khớp 81 lá số, nhưng lớp chuyển từ form sang engine
([to-chart-view.ts](../../apps/frontend/src/features/la-so/to-chart-view.ts)) có bảy chỗ sai, **đã sửa cả bảy**. Đây là phần **không** được cross-spec che, vì spec gọi thẳng `castChart`
chứ không đi qua form.

### 7.1 ✅ Giờ Tý sớm không tới được engine

`HOUR_MIDPOINTS.Tý = 0` trong `to-chart-view.ts`, nên nhánh `effectiveDate` của
[cast-chart.ts](../../apps/frontend/src/lib/tu-vi/cast-chart.ts) — chỉ chạy khi `hour === 23` — không
bao giờ được kích hoạt qua giao diện. Người sinh 23:00–23:59 bị tính vào ngày âm hôm trước, kéo theo
Tử Vi lệch và **cả mười bốn chính tinh sai theo**.

Gốc rễ: `BIRTH_HOURS` chỉ cho chọn chi (`Tý` = "23:00 - 00:59"), mà một chi Tý trải qua hai ngày âm
khác nhau. Không có cách nào suy ra từ chi.

**Đã làm:** `BIRTH_HOURS` thành mười ba mục xếp theo đồng hồ, mang luôn giờ đại diện — `Tý` là
00:00-00:59 (`hour = 0`) và `Tý sớm` là 23:00-23:59 (`hour = 23`). `HOUR_MIDPOINTS` bị xoá vì giờ đã
nằm ngay trong bảng, và `BirthHourChi` đổi tên thành `BirthHourKey` do `Tý sớm` không còn là một chi.

Chọn hướng khoá chữ thay vì `hour` số 0–23 để **mười hai giá trị URL cũ giữ nguyên ý nghĩa** — link
đã chia sẻ không hỏng, chỉ thiếu lựa chọn Tý sớm mà trước đây vốn không diễn đạt được.

Làm xong lộ thêm một chỗ lệch cùng gốc: thiên bàn dựng lại ngày âm từ `solarDate` **chưa dời**, nên
lá số Tý sớm vẽ theo ngày âm hôm sau mà dòng ngày lại in ngày hôm trước. `TuViChart` giờ trả kèm
`lunar`, và bốn dòng can chi của thiên bàn đọc thẳng từ `chart.pillars` thay vì tự tính lại.

### 7.2 ✅ `Thiên Riêu` không khớp `Thiên Diêu`

`HUNG_TINH` trong `to-chart-view.ts` ghi `'Thiên Riêu'`, còn engine luôn phát `'Thiên Diêu'`
(`phu-tinh-data.ts`, `sao-ngu-hanh-data.ts`, `bang-tra-data.ts` đều dùng "Diêu"). Sao này vĩnh viễn
rơi vào cột cát tinh.

Đã sửa chuỗi, và xử lý gốc ở mục 8.2 nên lỗi cùng loại giờ là lỗi biên dịch. Test
`puts Thiên Diêu in the hung column` trong `to-chart-view.spec.ts` chốt lại hành vi.

### 7.3 ✅ `isRealDate` áp nhầm cho lịch âm

[birth-form-schema.ts](../../apps/frontend/src/features/la-so/birth-form-schema.ts) kiểm ngày bằng
`new Date(year, month - 1, day)` cho **cả hai** loại lịch. Ngày 30 tháng 2 âm lịch là ngày có thật
nhưng bị form từ chối vì tháng 2 dương không có ngày 30.

**Đã làm:** `isRealBirthDate` trong [birth-input.ts](../../apps/frontend/src/features/la-so/birth-input.ts)
rẽ nhánh theo `calendar`. Lịch âm không tra bảng độ dài tháng mà **đổi sang dương rồi đổi ngược lại**
— ngày không có thật tràn sang tháng sau nên không quay về chính nó. Cách này không thêm dữ liệu mới
và tự đúng với cả tháng nhuận.

Đã quét toàn bộ 44.611 ngày âm có thật từ 1900 đến 2026: không ngày nào bị từ chối oan. 30/2/2002 âm
(12/4/2002 dương) được nhận, 30/2/2007 âm bị từ chối.

### 7.4 ✅ URL bỏ qua phép kiểm ngày thật

`birthInputSchema` chỉ chặn `day` trong 1–31, không kiểm ngày có tồn tại. Vào
`/la-so?day=31&month=2&...` thì `new Date` cuộn sang 2/3 và trang vẫn dựng một lá số trông như thật.

**Đã làm:** `birthInputSchema` mang `.refine(isRealBirthDate)`, nên cả form lẫn URL đi qua cùng một
phép kiểm. `birthSearchSchema` tách ra từ object gốc chưa refine vì `/la-so` trần vẫn phải parse được.

Khác kế hoạch một chỗ: **refinement ở `birthFormSchema` vẫn giữ**, không bỏ được. Form làm việc trên
chuỗi và cần lỗi gắn vào `path: ['day']` để hiện dưới ô ngày, còn `birthInputSchema` chỉ chạy sau khi
form đã hợp lệ. Hai nơi giờ gọi chung `isRealBirthDate` nên không còn luật chép đôi.

### 7.5 ✅ Nhập lịch âm thì dòng "dương lịch" in lại chính ngày âm

`to-chart-view.ts` dựng `solarMonth` từ `input.month` và `lunar.month` — khi người dùng nhập lịch
âm, `input.month` **là** tháng âm, và `lunar.month` quy ngược lại cũng ra đúng nó. Kết quả là thiên
bàn in "2 (2)", còn ngày dương đã quy đổi không xuất hiện ở đâu.

**Đã làm:** ba dòng dương lịch đọc từ `solarDate` đã quy đổi thay vì từ `input`. Nhập mùng 2 tháng
12 năm Canh Tuất âm giờ ra `1911` / `1 (12)` / `1 (2)` — đúng ngày dương 1/1/1911.

### 7.6 ✅ `ViewYearPicker` thiếu năm hiện tại với người sinh trước 1907

Danh sách năm chạy `birthYear .. birthYear + 119`. Sinh năm 1900 thì dải dừng ở 2019, trong khi
`viewYear` mặc định là năm hiện tại — `<select>` hiển thị một năm khác hẳn năm lá số đang tính.

**Đã làm:** dải kéo từ `min(birthYear, value)` tới `max(birthYear + 119, value)`, tức luôn chứa năm
đang xem. Sửa luôn chiều ngược lại mà mục này chưa nêu: `?year=2000&viewYear=1950` cũng khiến select
rơi về mục đầu và hiện một năm khác năm lá số đang tính.

### 7.7 ✅ `effectiveDate` cộng mili-giây

`new Date(solarDate.getTime() + MS_PER_DAY)` không tăng ngày khi vắt qua mốc đổi giờ.

Quét lại 1955–1980 trong `Asia/Ho_Chi_Minh` thì đây **không phải chuyện giả định**: hai ngày dài hai
mươi lăm tiếng là **1/7/1955** và **12/6/1975** — hôm sau 12/6/1975 chính là ngày Việt Nam bỏ UTC+8
về UTC+7. Người sinh giờ Tý sớm hai hôm đó lấy nhầm ngày âm.

**Đã làm:** `new Date(year, month, day + 1)` để trình duyệt tự chuẩn hoá. Test ghim
`process.env.TZ = 'Asia/Ho_Chi_Minh'` nên tái hiện được bất kể múi giờ của máy chạy CI.

---

## 8. ✅ Dọn engine cho dễ bảo trì

Logic đúng, nhưng có mấy chỗ lặp đã quá ngưỡng rule-of-three và một lỗ hổng kiểu khiến 7.2 xảy ra.
Đã dọn hết, trừ phần memo của 8.5 — cố ý không làm, lý do ghi ngay tại mục đó.

### 8.1 ✅ `mod12` và `CHI_COUNT` bị chép nhiều bản

`function mod12` xuất hiện **sáu** lần (`dia-ban`, `an-chinh-tinh`, `an-phu-tinh-suy-dien`,
`an-hoa-linh-tinh`, `tieu-han`, `luu-nien`), thêm hai chỗ viết thẳng biểu thức `((x % 12) + 12) % 12`
trong `an-vong-trang-sinh` và `van-han`. `const CHI_COUNT = 12` khai báo **mười một** lần trên toàn
`src`, trong đó `dia-ban.ts` đã export sẵn một bản.

**Đã làm:** [chi.ts](../../apps/frontend/src/lib/tu-vi/chi.ts) giữ `CHI_COUNT` và `mod12`. Trong
`lib/tu-vi` giờ mỗi thứ chỉ còn đúng một bản, và không còn chỗ nào viết tay `((x % 12) + 12) % 12`.

Các file ngoài `lib/tu-vi` để lần dọn riêng như đã định — `nap-am`, `phi-tinh`, `gio-hoang-dao`,
`gio-xuat-hanh`, `nhi-thap-bat-tu` và `features/la-so/board-layout.ts` vẫn còn `CHI_COUNT` cục bộ.

### 8.2 ✅ Tên sao là `string` trần

Cùng một tên sao đang được gõ tay ở sáu nơi: `phu-tinh-data.ts`, `sao-ngu-hanh-data.ts`,
`bang-tra-data.ts`, `an-phu-tinh-suy-dien.ts`, `tu-hoa.ts` và `HUNG_TINH` trong `to-chart-view.ts`.
Không có gì bắt chúng khớp nhau — đó chính là cách lỗi 7.2 lọt qua cả compiler lẫn 1326 test.

Đã làm: [sao-names.ts](../../apps/frontend/src/lib/tu-vi/sao-names.ts) giữ 14 + 83 tên làm nguồn duy
nhất, sinh ra `ChinhTinhName` / `PhuTinhName` / `SaoName`. Mọi bảng tra thành `Record<…Name, …>` nên
thiếu hay thừa một sao là lỗi biên dịch, và `HUNG_TINH_NAMES` dùng `satisfies` để tsc trỏ thẳng vào
tên sai — gõ `'Thiên Riêu'` giờ báo _Did you mean `'Thiên Diêu'`?_.

### 8.3 ✅ Bốn interface placement giống hệt nhau

`ChinhTinhPlacement`, `PhuTinhPlacement`, `DerivedPlacement`, `HoaLinhPlacement` đều là
`{ name; chiIndex }`.

**Đã làm:** gộp thành `SaoPlacement<N extends SaoName>` trong
[sao-placement.ts](../../apps/frontend/src/lib/tu-vi/sao-placement.ts), cùng khuôn generic với
`SaoView` của `cast-chart.ts` nên hai lớp đọc giống nhau.

### 8.4 ✅ `hoa as string` trong `cast-chart.ts`

`{ name: hoa as string, chiIndex }` ép kiểu chỉ để hạ `HoaName` xuống `string`. Sau 8.2 thì
`HoaName` là một nhánh của `SaoName` và cast đã biến mất.

### 8.5 ✅ Tách `castChart` theo trục "đổi năm xem" · 🟡 memo hai tầng

**Đã làm phần tách.** `castNatal(input)` dựng lá số gốc, `applyViewYear(natal, viewYear)` phủ bốn
tầng theo năm xem, `castChart` còn đúng một dòng ghép hai cái lại. Ranh giới giờ nằm trong kiểu:
`NatalChart` / `NatalCungView` không có trường nào theo năm xem, `TuViChart` / `CungView` mở rộng
thêm. Một hàm 85 dòng lo bốn việc thành 101 + 24 + 3 dòng, mỗi hàm một việc.

**Chưa làm phần memo, và nên cân nhắc lại có đáng không.** Lý do ban đầu là "đổi năm dựng lại cả 97
sao", nhưng đo thật thì `castChart` chạy **0,027 ms/lần** — rẻ hơn hẳn một lượt render lại bàn lá số.

Muốn memo được còn phải trả thêm giá: `search` của router đổi identity mỗi lần `viewYear` đổi, nên
`useMemo` phải khoá bằng một cache key tự bện từ các trường ngày sinh, kèm một chỗ tắt
`react-hooks/exhaustive-deps`. Đổi code xấu hơn lấy 0,027 ms thì trái đúng luật "đo trước khi tối
ưu" của repo. Phần tách đã xong nên nếu sau này có số đo biện minh được thì làm tiếp rất nhanh.

### 8.6 ✅ `rating` nên là union type

`rating: string | null` chạy suốt từ `bang-tra-data` ra tới `SaoView` của giao diện, trong khi tập
giá trị đóng: `M / V / Đ / B / H`.

**Đã làm:** `Rating` trong [sao-rating.ts](../../apps/frontend/src/lib/tu-vi/sao-rating.ts), và
`chart-types.ts` bỏ được dòng chú thích liệt kê năm bậc bằng lời.

**Chọn union chứ không phải enum như mục này ghi ban đầu.** Hai lý do: `rating` hiện **không được so
sánh ở đâu cả**, chỉ truyền qua rồi in ra trong `cung-card.tsx`, nên cái lợi "tên có nghĩa tại chỗ
dùng" của enum chưa dùng tới; còn enum thì buộc viết lại 336 ô của hai bảng tra thành `Rating.Dac`,
phá mất dạng lưới vốn là thứ duy nhất cho phép đối chiếu tay với sách. `NguHanh` trong `nap-am.ts`
cũng đã là union đúng khuôn này.

Type safety vẫn đủ: gõ `'D'` (chữ D Latin) thay vì `'Đ'` trong bảng giờ là lỗi biên dịch trỏ đúng ô
— một lỗi rất dễ mắc vì hai chữ nhìn gần giống nhau.

---

## 9. 🟡 Tầng `ĐV.*` — sao lưu theo đại vận

**Phát hiện trong lúc cào mục 4, chưa có ở mô tả cũ nào.** API lưu niên trả thêm mười hai sao mang
`type: "luu-theo-dai-van"`: `ĐV. Lộc Tồn`, `ĐV. K Dương`, `ĐV. Đà La`, `ĐV. Xương`, `ĐV. Khúc`,
`ĐV. T Khôi`, `ĐV. T Việt`, `ĐV. T Mã`, và bốn hoá `ĐV. H Lộc / H Quyền / H Khoa / H Kỵ`.

Chúng **không đổi theo năm xem mà đổi theo đại vận** — trong mẫu 2015–2030 chúng giữ nguyên suốt
2015–2023 rồi nhảy một lần ở 2024, đúng lúc lá số sang vận mới.

**Cách làm:** cào lại với các năm xem trải nhiều đại vận của cùng một lá số, rồi thử giả thuyết
tương tự mục 4 — dùng lại bảng natal nhưng thay can chi năm sinh bằng **can chi của cung đại vận**.
Hạ tầng cào đã có sẵn, chỉ đổi tham số.

---

## Phase sau

Hai mục dưới đây cần chốt hướng sản phẩm trước khi làm, không phải việc thuần kỹ thuật.

## P2-1. Nối luận giải vào lá số thật

**Vấn đề:** [luan-giai-data.ts](../../apps/frontend/src/features/la-so/luan-giai-data.ts) là nội dung
mẫu cứng. Giao diện đã xong (6 chương, accordion, skeleton, nút phân tích) nhưng chữ hiện ra không
liên quan tới lá số người dùng.

**Vì sao quan trọng:** đây là khoảng cách lớn nhất giữa "có lá số" và "có sản phẩm".

**Cách làm:** cần chốt trước — sinh chữ từ bảng luật viết tay, hay gọi AI. Bước chung cho cả hai
hướng là rút **dữ kiện** từ `TuViChart` cho mỗi mục con (cung nào, sao nào, miếu hãm ra sao, có Tuần
Triệt không), vì cả hai hướng đều cần lớp dữ kiện ấy.

**Acceptance:** hai ngày sinh khác nhau cho hai bài luận khác nhau ở mọi chương.

---

## P2-2. Lưu và xem lại lá số

**Vấn đề:** lập xong, reload là mất.

**Cách làm:** theo Phần 4 của kế hoạch gốc — chỉ lưu `BirthInput` chứ không lưu lá số đã tính, vì lá
số là hàm thuần của input nên engine cải tiến sau sẽ tự áp ngược cho dữ liệu cũ.

- Khách vãng lai: `localStorage` key `tuvi:saved-charts`, có version để migrate sau.
- Đã đăng nhập: entity + migration viết tay + `GET/POST/DELETE /api/tu-vi/charts`, mọi query lọc
  theo `user_id`, unique constraint để lưu lại không sinh bản trùng.
- Đăng nhập xong thì đẩy local lên server rồi xoá local (`POST /charts/bulk`, idempotent nhờ unique).

> **Không chạy `pnpm db:migration:generate`** — `apps/backend/ormconfigs.ts` hard-code `entities` và
> đã sót entity, generate sẽ sinh lệnh `DROP`. Viết tay như mọi migration hiện có.

**Acceptance:** chưa đăng nhập lập 2 lá số, reload vẫn còn; đăng nhập thì cả 2 lên server và
localStorage rỗng.
