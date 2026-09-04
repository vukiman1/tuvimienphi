# Lá số Tử Vi — thuật toán an sao

Ghi lại phần lõi của engine trong `apps/frontend/src/lib/tu-vi/`, kèm những chỗ dễ sai đã thực sự sai
trong lúc dựng. Toàn bộ luật ở đây đối chiếu khớp **33 lá số thật lấy từ tuvi.vn**
(`tuvi-vn-charts.fixture.ts`), phủ đủ 10 can năm, 12 chi năm, 12 tháng âm, 12 giờ sinh, 5 cục và cả
bốn tổ hợp Dương Nam / Dương Nữ / Âm Nam / Âm Nữ.

---

## 1. Ba con số quyết định cả lá số

Toàn bộ lá số treo vào **tháng âm**, **chi giờ sinh** và **ngày âm**. Sai một trong ba là hỏng cả
bàn, nên phần đổi lịch phải chắc trước khi nói tới an sao.

### Ranh giới năm âm

`1/2/2002` dương rơi **trước** Tết Nhâm Ngọ (12/2/2002), nên vẫn thuộc **ngày 20 tháng 12 năm Tân Tị**.
Lấy luôn `2002` làm năm âm sẽ ra Nhâm Ngọ — sai trụ năm, kéo theo sai cục, sai tứ hoá, sai Tuần Triệt.

### Giờ Tý sớm

23:00–23:59 đã thuộc về **ngày âm hôm sau**. Lệch một ngày là Tử Vi lệch, kéo cả mười bốn chính tinh
sai theo.

Hệ quả cho thiết kế API: `castChart` phải nhận **giờ đồng hồ 0–23**, không nhận chi giờ. Nhận chi thì
23:30 và 00:30 cùng ra "Tý", thông tin đã mất trước khi vào hàm.

---

## 2. An cung Mệnh và cung Thân

```
cungMệnh = (2 + thángÂm − 1 − chiGiờ) mod 12
cungThân = (2 + thángÂm − 1 + chiGiờ) mod 12
```

Số `2` là **cung Dần** — mốc đếm của mọi phép an cung (tháng Giêng ứng với Dần). Khởi từ Dần, đếm
thuận tới tháng sinh, rồi từ đó Mệnh đếm **nghịch** còn Thân đếm **thuận** tới giờ sinh.

### Sáu cung "Thân cư" không phải quy tắc, nó rơi ra từ dấu ±

Trừ hai vế:

```
Thân − Mệnh = 2 × chiGiờ  (mod 12)
```

Nhân đôi thì luôn chẵn, nên Thân chỉ cách Mệnh 0, 2, 4, 6, 8 hoặc 10 — không bao giờ lẻ. Sáu vị trí
đó đúng là sáu cung Thân cư mà sách liệt kê:

| Lệch | 0    | 2        | 4        | 6        | 8        | 10      |
| ---- | ---- | -------- | -------- | -------- | -------- | ------- |
| Cung | Mệnh | Phúc Đức | Quan Lộc | Thiên Di | Tài Bạch | Phu Thê |

Sinh giờ Tý hoặc Ngọ thì `2h mod 12 = 0`, Thân trùng Mệnh.

---

## 3. Mười hai cung — nhớ bằng câu chuyện đời người

Chỉ cung Mệnh phải tính. Mười một cung còn lại là đếm, theo một thứ tự cố định.

Đếm **nghịch** từ Mệnh thì nó thành một mạch đời người, dễ nhớ hơn hẳn học vẹt:

> **mình** → anh em → vợ chồng → con cái → tiền bạc → bệnh tật → đi xa → bạn bè → nghề nghiệp →
> nhà cửa → phúc phần → cha mẹ

tức Mệnh · Huynh Đệ · Phu Thê · Tử Tức · Tài Bạch · Tật Ách · Thiên Di · Nô Bộc · Quan Lộc ·
Điền Trạch · Phúc Đức · Phụ Mẫu.

### Cái bẫy thuận / nghịch

Sách đếm **nghịch**, nhưng trên lá số các cung xếp **thuận** theo chi. Chép thẳng thứ tự trong sách
vào mảng rồi tra theo chiều tăng của chi sẽ **soi gương ngược** — Phụ Mẫu nhảy sang chỗ Huynh Đệ.
Mảng trong code là danh sách trên **đảo ngược**:

```ts
CUNG_NAMES = ['Mệnh', 'Phụ Mẫu', 'Phúc Đức', 'Điền Trạch', 'Quan Lộc', 'Nô Bộc',
              'Thiên Di', 'Tật Ách', 'Tài Bạch', 'Tử Tức', 'Phu Thê', 'Huynh Đệ'];
cungNameAt(chi, menh) = CUNG_NAMES[(chi − menh) mod 12];
```

Câu để nhớ: **sách đếm nghịch, mảng đếm thuận**.

### Tam hợp không phải chuyện ngẫu nhiên

Quan Lộc cách Mệnh 4 cung, Tài Bạch cách 8 — nên **Mệnh · Quan Lộc · Tài Bạch chính là một tam hợp**.
Tương tự Phu Thê (+10) hợp với Phúc Đức (+2) và Thiên Di (+6).

Vì vậy tam giác nối khi rê chuột lên một cung luôn nối ba cung có liên quan về nghĩa, chứ không phải
nối bừa. Đó cũng là lý do một chuyên đề như "công danh sự nghiệp" phải đọc cả tam hợp Mệnh – Quan –
Tài chứ không đọc riêng cung Quan Lộc.

---

## 4. Can của cung, và cục

### Ngũ hổ độn

Can của **cung Dần** suy từ can năm theo chu kỳ 5, các cung sau đếm thuận:

| Can năm  | Giáp/Kỷ  | Ất/Canh | Bính/Tân | Đinh/Nhâm | Mậu/Quý  |
| -------- | -------- | ------- | -------- | --------- | -------- |
| Cung Dần | Bính Dần | Mậu Dần | Canh Dần | Nhâm Dần  | Giáp Dần |

```
canCủaCung = (canDần + (chi − 2) mod 12) mod 10
```

Chỗ `(chi − 2) mod 12` phải lấy mod **trước**: Tý đứng **sau** Hợi trong vòng đếm nên cách Dần 10
bước, không phải −2. Trừ thẳng sẽ lệch can ở Tý và Sửu — lỗi này chỉ lộ ra khi đối chiếu đủ 12 cung.

### Cục lấy từ cung Mệnh, không phải trụ năm

```
cục = nạp âm của (can cung Mệnh, chi cung Mệnh)
```

→ Thủy 2 · Mộc 3 · Kim 4 · Thổ 5 · Hỏa 6.

Ví dụ 1/2/2002: cung Mệnh ở Thân, can chi là **Bính Thân** → nạp âm _Sơn Hạ Hỏa_ → **Hỏa Lục Cục**.
Trong khi trụ năm **Tân Tị** cho _Bạch Lạp Kim_ — đó là **bản mệnh**, một thứ khác.

---

## 5. Mười bốn chính tinh

```
q = ceil(ngàyÂm / cục)
r = q × cục − ngàyÂm
TửVi     = r chẵn ? (2 + q − 1 + r) : (2 + q − 1 − r)   (mod 12)
ThiênPhủ = (4 − TửVi) mod 12
```

`r` chẵn thì cộng, lẻ thì trừ — chỗ này nhiều bản chép sai dấu. Thiên Phủ soi gương với Tử Vi qua
trục Dần – Thân, nên hai cung đó là điểm bất động.

Từ hai mốc rải hai vòng:

- **Vòng Tử Vi, đi nghịch**: Thiên Cơ −1, Thái Dương −3, Vũ Khúc −4, Thiên Đồng −5, Liêm Trinh −8
- **Vòng Thiên Phủ, đi thuận**: Thái Âm +1, Tham Lang +2, Cự Môn +3, Thiên Tướng +4, Thiên Lương +5,
  Thất Sát +6, Phá Quân +10

Bước nhảy không đều (Thiên Cơ sát ngay, rồi hụt một cung mới tới Thái Dương) nên phải ghi bảng, đếm
đều là sai.

### Chạy thử: 1/2/2002 giờ Tị

Ngày âm 20, Hỏa Lục Cục:

```
q = ceil(20 / 6) = 4
r = 4 × 6 − 20   = 4        → chẵn nên CỘNG
Tử Vi     = (2 + 4 − 1) + 4 = 9   → Dậu
Thiên Phủ = (4 − 9) mod 12  = 7   → Mùi
```

Rải hai vòng từ đó:

| Cung    | Chính tinh            |     | Cung | Chính tinh         |
| ------- | --------------------- | --- | ---- | ------------------ |
| Tý      | Thiên Lương           |     | Ngọ  | Thái Dương         |
| Sửu     | Liêm Trinh · Thất Sát |     | Mùi  | Thiên Phủ          |
| **Dần** | **vô chính diệu**     |     | Thân | Thiên Cơ · Thái Âm |
| **Mão** | **vô chính diệu**     |     | Dậu  | Tử Vi · Tham Lang  |
| Thìn    | Thiên Đồng            |     | Tuất | Cự Môn             |
| Tị      | Vũ Khúc · Phá Quân    |     | Hợi  | Thiên Tướng        |

### Vô chính diệu

Mười bốn sao rải vào mười hai cung, mà nhiều cung ôm hai sao — nên **luôn có cung trống**. Cung không
có chính tinh gọi là _vô chính diệu_, và khi luận thì **mượn sao của cung xung chiếu** (cung đối
diện, cách 6) để đọc.

---

## 6. Miếu vượng đắc bình hãm — thang độ sáng

Chữ trong ngoặc sau tên chính tinh: `(M) (V) (Đ) (B) (H)`. Nó đo **độ sáng của sao tại cung sao
đó đóng** — không đổi vị trí sao, chỉ đổi cách luận.

```
Miếu  >  Vượng  >  Đắc  >  Bình  >  Hãm
```

### Nghĩa đen của năm chữ

|       | Hán | Nghĩa đen          | Hình ảnh                                            |
| ----- | --- | ------------------ | --------------------------------------------------- |
| Miếu  | 廟  | ngôi miếu, đền thờ | Thần về đúng miếu của mình, có người hương khói.    |
| Vượng | 旺  | thịnh, rực cháy    | Ghép 日 _nhật_ + 王 _vương_ — mặt trời lúc làm vua. |
| Đắc   | 得  | được, giành được   | Rút gọn của **đắc địa** 得地, _được chỗ_.           |
| Bình  | 平  | bằng, phẳng        | Không được trợ, không bị cản.                       |
| Hãm   | 陷  | sa xuống hố        | Ghép 阝 _gò đất_ + 臽 _người rơi xuống hố_.         |

Đọc liền từ trên xuống là câu chuyện chỗ ở của một vị thần: ở miếu mình → đang lúc rực rỡ → kiếm
được chỗ đứng → đứng chỗ bằng → rơi xuống hố.

**陷 không có nghĩa là yếu, mà là mắc kẹt.** Sức còn nguyên, chỉ mất đường thoát. Đây là mấu chốt để
hiểu vì sao sao hung ở hãm lại đáng ngại.

### Thái Dương và Thái Âm — chỗ duy nhất thấy rõ logic

Lấy nguyên hai dòng trong `CHINH_TINH_RATINGS`, xếp theo mười hai chi:

|            | Tý  | Sửu | Dần | Mão | Thìn | Tị    | Ngọ   | Mùi | Thân | Dậu   | Tuất  | Hợi   |
| ---------- | --- | --- | --- | --- | ---- | ----- | ----- | --- | ---- | ----- | ----- | ----- |
| Thái Dương | H   | Đ   | V   | V   | V    | **M** | **M** | Đ   | H    | –     | H     | H     |
| Thái Âm    | V   | Đ   | H   | H   | H    | –     | H     | Đ   | V    | **M** | **M** | **M** |

Đọc theo giờ trong ngày: Dần–Mão–Thìn là sáng sớm tới sáng nên Thái Dương **vượng**; Tị–Ngọ giữa
trưa nên **miếu**; Thân–Tuất–Hợi–Tý tối tới nửa đêm nên **hãm**. Đúng quỹ đạo mặt trời thật.

Thái Âm soi gương ngược lại: miếu ở Dậu–Tuất–Hợi lúc chập tối, hãm giữa ban ngày.

### Bậc Bình gần như không tồn tại

Đếm cả bảng 168 ô:

| M   | V   | Đ   | B     | H   | trống |
| --- | --- | --- | ----- | --- | ----- |
| 38  | 35  | 34  | **6** | 41  | 14    |

Sáu ô Bình đó, không hơn không kém:

> **Tử Vi** tại Mão · Dậu · Hợi — **Thiên Phủ** tại Sửu · Mão · Dậu

Chỉ hai đế tinh mới có bậc Bình: đi đâu cũng còn giữ được thể diện, không đến nỗi hãm, nên cần thêm
một bậc lưng chừng. Mười hai sao còn lại chỉ chạy trên bốn bậc M · V · Đ · H.

### Sao hung ở hãm là tổ hợp tệ nhất

|               | Miếu / Vượng                     | Hãm                                     |
| ------------- | -------------------------------- | --------------------------------------- |
| **Cát tinh**  | tốt trọn vẹn                     | tốt mà không phát huy, thành hư danh    |
| **Hung tinh** | mãnh liệt có chỗ dùng → uy quyền | **sức phá nguyên vẹn, mất đường thoát** |

_Hung tinh đắc địa phát dã như lôi_ — được đất thì phát như sấm; mất đất thì tiếng sấm ấy nổ trong
nhà. Cụ thể theo cặp:

| Sao        | Miếu / Vượng                          | Hãm                           |
| ---------- | ------------------------------------- | ----------------------------- |
| Thất Sát   | quyết đoán, dám gánh                  | liều, đâm đầu, gãy giữa đường |
| Phá Quân   | phá cũ dựng mới                       | phá mà không dựng lại được    |
| Tham Lang  | tham vọng có định hướng, giỏi giao tế | sa đà, hưởng lạc              |
| Cự Môn     | ăn nói sắc bén, hợp nghề dùng miệng   | thị phi, khẩu thiệt           |
| Liêm Trinh | nguyên tắc, cứng cỏi                  | chấp nê, chuốc oán            |

### Bốn cung gánh phần lớn số ô hãm

Chỗ năm sao trên rơi vào hãm:

```
Tham Lang    Tý · Mão · Tị · Dậu · Hợi
Phá Quân     Mão · Tị · Thân · Dậu · Hợi
Liêm Trinh   Mão · Tị · Dậu · Hợi
Thất Sát     Mão · Thìn · Dậu
Cự Môn       Sửu · Thìn · Tị · Tuất
```

**Mão · Tị · Dậu · Hợi** lặp lại gần như đủ. Đếm cả mười bốn chính tinh thì bốn cung đó cũng dày nhất:

```
Mão ██████ 6   Tị ██████ 6   Dậu ██████ 6   Hợi ██████ 6
Thìn ████ 4    Tuất ███ 3    còn lại ≤ 2
```

Mà **Mão–Dậu** là một trục xung, **Tị–Hợi** là một trục xung — hai trong sáu trục của địa bàn gánh
phần lớn số ô hãm.

Con số trên là **sàn chứ không phải chính xác**, vì bảng còn 14 ô trống. Riêng Mùi đang hiện 0 nhưng
thiếu tới 2 ô, đừng đọc thành "cung an toàn nhất".

### Ba thứ đổi hẳn kết luận

Một sao hãm chưa quyết định gì.

- **Tuần / Triệt án ngữ.** _Hung tinh gặp Tuần Triệt thì giảm hung, cát tinh gặp Tuần Triệt thì giảm
  cát_ — Tuần Triệt chặn không phân biệt tốt xấu, nên đè lên một cung đầy sao hung hãm lại là **may**.
  Chỗ này hay bị đọc ngược.
- **Sao giải.** Thiên Giải, Địa Giải, Giải Thần, Thiên Quan, Thiên Phúc, Hóa Khoa đóng cùng cung thì
  hoá bớt.
- **Cung nào.** Hung tinh hãm ở Nô Bộc là chuyện bạn bè, ở Mệnh mới là chuyện bản thân. Cùng một sao,
  cùng một bậc, hai kết luận khác nhau.

### Vì sao phải tra bảng chứ không tính

Gốc là **ngũ hành sinh khắc** giữa hành của sao và hành của cung: được sinh thì sáng, bị khắc thì tối.
Nhưng bảng cổ **không theo đúng ngũ hành** — Thái Dương và Thái Âm chạy theo quỹ đạo mặt trời mặt
trăng như trên, chứ không theo sinh khắc, và vài ô khác là quy ước riêng của từng phái. Viết công
thức ngũ hành sẽ lệch bảng ở hàng chục ô.

---

## 7. Phụ tinh — 83 sao, năm kiểu luật

| Kiểu          | Số sao | Cách an                                                                      |
| ------------- | ------ | ---------------------------------------------------------------------------- |
| Tra bảng      | 58     | theo can năm (16) · chi năm (29) · tháng âm (7) · giờ sinh (6)               |
| Vòng Bác Sĩ   | 12     | khởi tại Lộc Tồn, mỗi sao một bước, **đi theo chiều âm dương nam nữ**        |
| Neo theo cung | 2      | Thiên Thương ở Nô Bộc, Thiên Sứ ở Tật Ách                                    |
| Công thức     | 7      | Tam Thai · Bát Tọa · Ân Quang · Thiên Quý · Thiên Tài · Thiên Thọ · Đẩu Quân |
| Tứ hoá        | 4      | đóng ngay tại cung của sao nhận hoá                                          |

Vài luật dò ra từ dữ liệu rồi mới thấy trùng với lý thuyết cổ điển — coi như kiểm chứng chéo:

- **Thiên Thọ** = cung Thân + chi năm. Dò ra `(chi năm + tháng + giờ + 1)`, mà cung Thân đúng bằng
  `(tháng + 1 + giờ)`.
- **Đẩu Quân** = từ cung Thái Tuế đếm nghịch tới tháng sinh, rồi đếm thuận tới giờ sinh.
- **Phi Liêm** ở bước 6 của vòng Bác Sĩ. Bước 6 thì thuận hay nghịch cũng ra cùng một cung, nên nó
  lọt được vào bảng tra theo can năm mà không mâu thuẫn.

Phần lớn phụ tinh **không** tính được bằng một phép cộng đều — chép bảng là cách trung thực nhất.

---

## 8. Vận hạn, vòng Tràng Sinh

**Đại vận**: khởi tại cung Mệnh với tuổi bằng đúng **số cục**, mỗi cung mười năm. Đi thuận nếu
**Dương Nam hoặc Âm Nữ**, ngược lại đi nghịch. Hai người sinh cùng giờ khác giới chạy vận ngược nhau.

Can năm chẵn là dương, lẻ là âm — Giáp dương, Ất âm, xen kẽ.

**Vòng Tràng Sinh**: khởi ở cung do số cục quyết định, rồi đi cùng chiều với đại vận.

| Cục      | 2 Thủy | 3 Mộc | 4 Kim | 5 Thổ | 6 Hỏa |
| -------- | ------ | ----- | ----- | ----- | ----- |
| Khởi tại | Thân   | Hợi   | Tị    | Thân  | Dần   |

**Nhãn `ĐV.*`**: cung chứa đại vận ứng với tuổi của năm xem thành `ĐV.MỆNH`, mười một cung sau đếm
thuận theo đúng thứ tự mười hai cung gốc. Tuổi ở đây là **tuổi mụ** (`năm xem − năm sinh + 1`).

**Tuần và Triệt** đều chắn hai cung liền nhau. Tuần suy từ tuần giáp của trụ năm — sáu mươi ngày phủ
mười can nhưng mười hai chi, luôn thừa ra hai chi không có can nào đi kèm, chính là hai chi bị chắn.
Triệt tra theo can năm, năm cặp lặp lại hai lần.

---

## 9. Hỏa Tinh, Linh Tinh, tiểu hạn và cung tháng

Bốn thứ này tách riêng vì chúng cần nhiều biến hơn một bảng tra một chiều.

### Hỏa Tinh và Linh Tinh

Cặp duy nhất cần cả nhóm tam hợp chi năm, giờ sinh **lẫn** chiều âm dương nam nữ:

```
Hỏa Tinh  = khởiHỏa[nhóm]  + chiều × chiGiờ
Linh Tinh = khởiLinh[nhóm] − chiều × chiGiờ
```

`chiều` là +1 với Dương Nam và Âm Nữ — **cùng chiều đại vận**. Hai sao luôn đi ngược nhau.

| Nhóm chi năm     | Hỏa khởi | Linh khởi |
| ---------------- | -------- | --------- |
| Dần · Ngọ · Tuất | Sửu      | Mão       |
| Thân · Tý · Thìn | Dần      | Tuất      |
| Tị · Dậu · Sửu   | Mão      | Tuất      |
| Hợi · Mão · Mùi  | Dậu      | Tuất      |

Khớp 66/66 lượt trên 33 lá số. Trước đó tưởng cần bảng 96 ô; hoá ra chỉ cần tám con số vì cấu trúc
là công thức chứ không phải bảng.

**Giờ Tý và giờ Ngọ không phân biệt được chiều** — nhân đôi rồi mod 12 ra 0 nên thuận hay nghịch
cũng cùng kết quả. Toàn bộ mẫu Dương Nam trong bộ 33 lá số rơi đúng vào hai giờ ấy, nên chiều của
Dương Nam suy ra từ luật chứ chưa được dữ liệu xác nhận.

### Tiểu hạn

```
tiểuHạn(tuổi) = khởiTiểuHạn[nhóm] + chiều × (tuổi − 1)
```

| Nhóm chi năm     | Khởi tại |
| ---------------- | -------- |
| Dần · Ngọ · Tuất | Thìn     |
| Thân · Tý · Thìn | Tuất     |
| Tị · Dậu · Sửu   | Mùi      |
| Hợi · Mão · Mùi  | Sửu      |

Chiều ở đây là **nam thuận nữ nghịch** — khác đại vận (dương nam âm nữ thuận). Hai người cùng tuổi
cùng giới nhưng khác can năm sẽ chạy đại vận ngược nhau mà tiểu hạn cùng chiều. Chỗ này dễ lẫn.

### Cung tháng `Th.N`

```
cungThángGiêng = tiểuHạn − (thángÂm − 1) + chiGiờ
```

Đúng cách an Đẩu Quân, chỉ thay mốc Thái Tuế bằng cung tiểu hạn. Nói cách khác **Đẩu Quân chính là
cung tháng Giêng của năm sinh** — cùng một phép dựng, khác mốc.

Mười một cung còn lại đếm thuận theo chi. Khớp 396/396 nhãn.

Vì phụ thuộc tuổi nên `Th.N` **đổi theo năm xem**. Đó là lý do lần dò đầu thất bại: tôi đi tìm một
tổ hợp tuyến tính của dữ liệu sinh, mà biến quyết định lại nằm ngoài lá số.

### Cân lượng

Xưng cốt ca: cộng bốn trọng lượng của trụ năm, tháng âm, ngày âm và giờ sinh. Đơn vị **chỉ**, mười
chỉ một lượng.

Bảng 114 ô mà chỉ có 57 lá số nên **không suy được bằng dữ liệu** — phải chép từ sách rồi kiểm
ngược. Bản chép đầu sai năm ô, dò ra bằng cách khoanh vùng: mỗi dòng sai có ba thành phần đã được
xác nhận ở dòng khác, nên lỗi quy về đúng ô còn lại.

| Ô                 | Bản chép | Đúng |
| ----------------- | -------- | ---- |
| Trụ năm Giáp Tuất | 1.5      | 0.5  |
| Trụ năm Kỷ Sửu    | 0.7      | 0.8  |
| Trụ năm Quý Hợi   | 0.6      | 0.7  |
| Tháng 10          | 0.8      | 1.8  |
| Ngày mùng 5       | 1.6      | 1.5  |

Hai ô cuối phải harvest thêm hai lá số mới tách được: ngày mùng 5 và ngày 25 chưa xuất hiện ở lá số
nào đúng, nên chưa biết lỗi nằm ở ô ngày hay ô trụ năm. Sau khi bổ sung thì khớp 57/57.

---

### Nhãn lưu niên `LN.*`

Vòng lưu niên **neo vào cung đại vận đang hiệu lực**, không neo vào địa bàn gốc. Đó là lý do mọi phép
dò trước đều hỏng: tôi đi tìm quan hệ với cung Mệnh, chi năm xem hay cung tiểu hạn, trong khi mốc
thật là `ĐV.MỆNH`.

```
n      = tuổi − tuổi khởi đại vận hiện tại      (0–9, năm thứ mấy trong vận)
lệch   = bảng[n], đảo dấu nếu đại vận đi nghịch
LN.MỆNH = ĐV.MỆNH + lệch
```

| n    | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| lệch | 0   | 6   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 0   |

Từ n = 2 trở đi thì lệch đúng bằng `n + 3`; riêng n = 0 và n = 1 lệch khỏi quy luật ấy. Chỗ bất
thường này có 5 và 10 lá số chứng thực nên không phải nhiễu, nhưng hình dạng bảng cho thấy mô hình
của tôi chưa phải dạng gốc.

### Vòng lưu niên chạy ngược ở đúng một trường hợp

Năm thứ tư của một đại vận **đi nghịch** là trường hợp duy nhất tên cung giảm dần theo chi thay vì
tăng. Sáu lá số trong bộ đều rơi vào đúng ô đó, và lá số thứ bảy cùng `n = 4` nhưng đại vận thuận thì
vẫn chạy xuôi.

Nhiều khả năng đây là **lỗi của tuvi.vn** chứ không phải luật tử vi — không phái nào đảo chiều vòng
mười hai cung ở đúng một năm của đúng một chiều vận. Repo giữ theo tuvi.vn vì đó là nguồn chân lý đã
chọn, nhưng chỗ này mới có bảy lá số chứng thực và bộ giữ riêng không chạm tới, nên nó yếu hơn hẳn
phần còn lại của luật.

### Cách kiểm

Luật dò từ 57 lá số rồi kiểm trên **24 lá số giữ riêng** chưa từng tham gia dò: 81 lá số, 972 nhãn,
không sai ô nào. Bộ giữ riêng có mặt ở n = 0 và n = 1 nên hai ô bất thường của bảng cũng được kiểm
độc lập.

---

## 9b. Lai nhân cung

Cung mang thiên can trùng can năm sinh.

Ngũ hổ độn rải mười can lên mười hai cung nên vòng đếm quay lại hai can đầu: **Tý luôn trùng can với
Dần, Sửu luôn trùng với Mão**. Vì thế đúng hai can sinh ra hai cung cùng khớp — tuổi **Nhâm** khớp cả
Tý lẫn Dần, tuổi **Tân** khớp cả Sửu lẫn Mão. Tám can còn lại luôn ra một cung duy nhất.

Trùng thì **lấy Tý/Sửu**. Vì hai cung ấy đứng đầu vòng chi, luật rút gọn thành **đếm xuôi từ Tý và
lấy cung khớp đầu tiên** — không cần liệt kê ngoại lệ.

| Can năm | Giáp | Ất  | Bính | Đinh | Mậu | Kỷ  | Canh | Tân | Nhâm | Quý |
| ------- | ---- | --- | ---- | ---- | --- | --- | ---- | --- | ---- | --- |
| Cung    | Tuất | Dậu | Thân | Mùi  | Ngọ | Tị  | Thìn | Sửu | Tý   | Hợi |

Tám can không trùng khớp hai ví dụ trên tracuutuvi.com: 1990 Canh Ngọ ra cung Thìn, 1969 Kỷ Dậu ra
cung Tị. Cột **Tân** đối chiếu bằng lá số thật trên tuvi.vn — 1/2/2002 dương, giờ Tị, nam, năm âm
Tân Tị — trang ra **Nô Bộc**, đúng cung Sửu của lá số đó, và cả chín dòng còn lại của thiên bàn cũng
khớp.

Cột **Nhâm** cũng đối chiếu bằng lá số thật: 15/6/2002 dương, giờ Ngọ, nam — năm âm Nhâm Ngọ, hai
ứng viên là Tý (cung Mệnh) và Dần (cung Phúc Đức). Trang ra **Mệnh**, tức cung Tý. Ca này còn cho
thấy lai nhân cung **được phép** rơi vào chính cung Mệnh.

Vậy cả mười can đều có chứng, công thức đóng.

Luật _"Tý khai thiên, Sửu tích địa"_ của phái Khâm Thiên Tứ Hoá cho kết quả ngược ở cả hai ca
(Tân → Mão, Nhâm → Dần) nên **đã loại**.

---

## 10. Những chỗ chưa giải được

| Hạng mục                   | Vì sao                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Lưu tinh `L.*`             | 35 sao phụ thuộc năm xem. Chưa dò — nhưng giờ đã biết mốc neo của tầng lưu niên là cung đại vận, nên đây là chỗ nên thử trước. |
| 14 ô miếu vượng chính tinh | Bảng 14 × 12 mới phủ 154/168.                                                                                                  |

---

## 11. Một chỗ tuvi.vn tự mâu thuẫn

Tân Sửu, giờ Mão, Âm Nam: tám lá số cùng nhóm Tị-Dậu-Sửu và cùng chiều nghịch đều khởi Hỏa Tinh tại
Mão, riêng lá số này khởi tại Thân — lệch năm cung. Lấy lại ở hai năm xem khác nhau, kết quả tái
hiện y nguyên nên không phải lỗi nhất thời.

Repo giữ luật cổ điển vì nó khớp 56/57, và loại đúng một sao khỏi phép so trong cross-spec thay vì bỏ
cả lá số — mười một nhóm assertion còn lại của nó vẫn có giá trị. Ngoại lệ ghi thẳng trong
`KNOWN_DIVERGENCES` chứ không giấu.

---

## 12. Thu dữ liệu đối chiếu

Query string trên URL lá số của tuvi.vn **chỉ để trang trí** — id trong slug mới quyết định lá số
nào được dựng.

**`viewYear` chỉ có tác dụng khi lá số chưa tồn tại.** POST lại cùng ngày sinh sẽ trả về bản đã lưu
kèm năm xem cũ, bất kể truyền gì. Đây là lý do lần dò đầu tưởng tuvi.vn bỏ qua tham số này: tôi thử
đi thử lại trên cùng một ngày sinh. Muốn lấy nhiều năm xem thì phải **đổi ngày sinh cho mỗi năm** —
làm vậy cũng tách luôn tuổi khỏi năm sinh, thứ mà một bộ chung năm xem không bao giờ làm được. Muốn lá số khác phải `POST /la-so` với `dayOfDOB`, `monthOfDOB`, `yearOfDOB`,
`calendar`, `hourOfDOB`, `gender`.

Trong HTML, bám **thuộc tính** chứ đừng cắt theo chuỗi mốc:

| Cần lấy                       | Dấu hiệu                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Phụ tinh                      | `data-name="sao-tot-xau"`                                                               |
| Chính tinh (kèm miếu vượng)   | `class="text-chinh-chinh"`                                                              |
| Tên cung                      | `class="text-sao-chinh-tinh"` — tên class đặt ngược, đây là tên cung chứ không phải sao |
| Can chi, tuổi đại vận, `Th.N` | `class="text-dia-chi"`, theo thứ tự xuất hiện                                           |
| Vòng Tràng Sinh               | `class="txt-tiny-mid"`                                                                  |
| Nhãn `ĐV.*`, `LN.*`           | `class="text-tieu-van"`                                                                 |

Từng cắt danh sách sao tại chuỗi `'Hóa Lộc'` và mất sạch sao đứng sau nó ở những cung mà **Hóa Lộc
chính là một sao đóng ở đấy**. Lỗi này làm hụt 20 sao trong bảng mà test vẫn xanh, vì dữ liệu thiếu
thì nhất quán một cách giả tạo.

---

## 13. Khác biệt chính tả với tuvi.vn

| tuvi.vn           | Repo này           | Ai sát chữ Hán hơn                                                     |
| ----------------- | ------------------ | ---------------------------------------------------------------------- |
| Tỵ                | **Tị**             | 巳 — repo                                                              |
| Lộ Trung Hỏa      | **Lô Trung Hỏa**   | 爐中火, lửa trong lò — repo                                            |
| **Phú Đăng Hỏa**  | ~~Phúc Đăng Hỏa~~  | 覆燈火, 覆 đọc _phú_ — tuvi.vn, đã sửa theo                            |
| **Tích Lịch Hỏa** | ~~Phích Lịch Hỏa~~ | 霹靂火 — tuvi.vn, đã sửa theo                                          |
| **Đầu Quân**      | Đầu Quân           | 斗君 đọc _đẩu_ — cả hai cùng viết sai, repo giữ nguyên để khớp fixture |

Hai dòng đầu chuẩn hoá ở tầng so sánh trong cross-spec, hai dòng giữa đã sửa thẳng trong `nap-am.ts`,
dòng cuối để nguyên vì đổi là cross-spec đỏ.
