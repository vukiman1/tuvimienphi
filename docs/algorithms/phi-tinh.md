# Cửu Cung Phi Tinh — thuật toán

Bốn bảng phi tinh (Năm / Tháng / Ngày / Giờ). Mỗi bảng: tính **sao trung cung** rồi bay 9 cung theo Lạc Thư.

Bước bay (Lạc Thư), lặp từ sao trung cung: `phiTinhPresenter = [5, 2, 1, 2, 2, 1, 2, 5]`, mỗi bước `next = (cur + step) % 9`, nếu `== 0` → `9`.

- **Thuận** (Dương độn): bay xuôi từ trung cung.
- **Nghịch** (Âm độn): bay như thuận rồi đảo ngược danh sách.

## Sao trung cung

### Niên (năm) — `nienPhiTinh`

- `year = getYearNumberByTietKhi(dd,mm,yy)` (lùi 1 nếu tiết là Tiểu Hàn/Đại Hàn — chưa qua Lập Xuân).
- `nienPT = 11 - totalN(year)` với `totalN` = cộng dồn các chữ số nhưng **bỏ qua chữ số 9**.
- `nienPT == 0` → `9`. `nienPT == 5` → dùng `tinhVan(year)`: van chẵn → 8, van lẻ → 2.

### Nguyệt (tháng) — `nguyetPhiTinh`

Tra bảng theo (chi tháng theo tiết khí) × (nhóm chi năm):

- Nhóm chi năm: **Tý/Ngọ/Mão/Dậu**, **Thìn/Tuất/Sửu/Mùi**, **Dần/Thân/Tị/Hợi**.
- Chi tháng lấy từ tiết khí (`getCanChiMonthByCanYear`): Dần=Lập Xuân/Vũ Thủy, Mão=Kinh Trập/Xuân Phân, … Sửu=Tiểu Hàn/Đại Hàn.
- Bảng trung cung (chi tháng → [TýNgọMãoDậu, ThìnTuấtSửuMùi, DầnThânTịHợi]):
  Dần[8,5,2] Mão[7,4,1] Thìn[6,3,9] Tị[5,2,8] Ngọ[4,1,7] Mùi[3,9,6]
  Thân[2,8,5] Dậu[1,7,4] Tuất[9,6,3] Hợi[8,5,2] Tý[7,4,1] Sửu[6,3,9]

### Nhật (ngày) — `nhatPhiTinh`

1. Can-chi ngày → thuộc tuần giáp nào (Giáp Tý/Tuất/Thân/Ngọ/Thìn/Dần) + offset (0–9) trong tuần.
2. Tiết khí ngày → độn + nguyên:
   - Dương độn: Thượng={Đông Chí,Tiểu Hàn,Đại Hàn,Lập Xuân}, Trung={Vũ Thủy,Kinh Trập,Xuân Phân,Thanh Minh}, Hạ={Cốc Vũ,Lập Hạ,Tiểu Mãn,Mang Chủng}.
   - Âm độn: Thượng={Hạ Chí,Tiểu Thử,Đại Thử,Lập Thu}, Trung={Xử Thử,Bạch Lộ,Thu Phân,Hàn Lộ}, Hạ={Sương Giáng,Lập Đông,Tiểu Tuyết,Đại Tuyết}.
3. Sao khởi theo (tuần giáp × độn × nguyên) — bảng:
   | Tuần giáp | Dương T/Tr/H | Âm T/Tr/H |
   | --------- | ------------ | --------- |
   | Giáp Tý   | 1/7/4        | 9/3/6     |
   | Giáp Tuất | 2/8/5        | 8/2/5     |
   | Giáp Thân | 3/9/6        | 7/1/4     |
   | Giáp Ngọ  | 4/1/7        | 6/9/3     |
   | Giáp Thìn | 5/2/8        | 5/8/2     |
   | Giáp Dần  | 6/3/9        | 4/7/1     |
4. Cộng offset: dương độn `+offset` (9→1 wrap), âm độn `-offset` (1→9 wrap).

### Thời (giờ) — `thoiPhiTinh`

Theo (chi ngày, độn của ngày, offset = index chi giờ 0–11):

- Sao khởi: dương độn → Tý/Ngọ/Mão/Dậu=1, Thìn/Tuất/Sửu/Mùi=4, còn lại=7;
  âm độn → 9 / 6 / 3.
- Cộng offset như nhật tinh (dương +, âm −).

## Tiết khí — `checkTietKhi`

Trả về 1 trong 24 tiết khí mà ngày đang thuộc. Trong lib mình: `getSolarTerm(date)` (kinh độ mặt trời, floor(deg/15)) — cùng ý nghĩa, chỉ cần chuẩn hóa hoa thị/chữ hoa khi so với bảng độn-nguyên.

## Cần khi implement

- Chuẩn hóa tên tiết khí (chữ hoa: "Lập Thu" vs "Lập thu").
- Lấy đúng thứ tự ô 3×3 theo Lạc Thư (xác nhận từ render lichdungsu).
- Verify 4 bảng trung cung + 9 ô với lichdungsu qua vài ngày khác nhau.
