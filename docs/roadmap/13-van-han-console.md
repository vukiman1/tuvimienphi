# Vận hạn trong console

Console soạn và xuất bản vận hạn 12 con giáp theo năm; trang công khai hiển thị năm đã xuất bản mới nhất.

---

## Bối cảnh

Kiểm tra ngày 07/10/2026:

- Bảng `van_han` **trống ở cả local lẫn production** (`GET /api/van-han?year=` trả `[]` cho 2025, 2026, 2027). Nội dung khách thấy là bản mẫu nằm trong bundle frontend (`van-han-mock.ts`), không phải dữ liệu DB.
- Đường ghi duy nhất là `POST /api/van-han`, chỉ chặn bằng JWT người dùng — mục 5 của [06-admin-console.md](06-admin-console.md). Không nơi nào trong repo gọi nó.
- Trang công khai chọn năm theo đồng hồ trình duyệt, nên đúng 1/1 sẽ hỏi năm mới dù chưa ai soạn.

## Quyết định

| Quyết định                                                         | Vì sao                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Xuất bản theo **năm**, không theo từng con giáp                    | Đổi năm là một quyết định duy nhất. Cờ theo từng dòng cho phép trạng thái 5/12 lọt ra ngoài, và gỡ một dòng sẽ kéo cả site về năm cũ                                                                                                                                                                                                 |
| Bảng `van_han_published_year` chỉ chứa năm đã xuất bản             | Có dòng nghĩa là đang công khai; gỡ xuất bản là xoá dòng. Không có trạng thái thứ ba để lệch                                                                                                                                                                                                                                         |
| Năm đã xuất bản từ chối bản lưu thiếu phần                         | Sửa bài của năm đang công khai có hiệu lực ngay, nên một phần để trống sẽ hiện ra trống                                                                                                                                                                                                                                              |
| Server tự suy ra tên con giáp, tiêu đề, `bornYears`, can chi, mệnh | Trang công khai tô màu thẻ theo chữ cuối của mệnh và khớp nhãn mục theo chuỗi chính xác; gõ tay lệch một dấu là sai màu mà không báo lỗi. Tính từ `@org/shared-tu-vi` thì không còn chỗ để lệch                                                                                                                                      |
| 4 nhãn mục và giới hạn độ dài nằm ở `@org/shared-contracts`        | Theme của trang công khai, validate của backend và form của console cùng đọc một chỗ                                                                                                                                                                                                                                                 |
| Ghi qua GraphQL admin, REST chỉ còn đọc                            | Guard đặt ở cấp resolver như mọi phần khác của console. `POST /api/van-han` bị xoá hẳn                                                                                                                                                                                                                                               |
| Migration đánh dấu mọi năm đang có dòng là đã xuất bản             | Giữ nguyên hành vi cho môi trường nào còn dữ liệu cũ. Với DB trống thì không làm gì                                                                                                                                                                                                                                                  |
| Bản mẫu 2026 nằm trong DB, không còn trong bundle frontend         | Migration `SeedVanHan2026` ghi 12 bài mẫu của năm 2026 và xuất bản năm đó; môi trường nào đã có dòng của năm 2026 thì bỏ qua. Trang công khai chỉ đọc API: chưa có năm nào xuất bản thì hiện trạng thái trống, không còn bản minh hoạ dựng sẵn. Tuổi Ngọ là bài viết tay, 11 tuổi còn lại là văn template cần viết lại trong console |

## API

Công khai (REST):

| Endpoint                   | Trả về                                                        |
| -------------------------- | ------------------------------------------------------------- |
| `GET /api/van-han/current` | `{ year, entries }` của năm đã xuất bản mới nhất, hoặc `null` |
| `GET /api/van-han?year=`   | Giữ cho bundle cũ còn cache; năm chưa xuất bản thì trả `[]`   |

Console (GraphQL, `/api/admin/graphql`):

| Field                                                   | Việc                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `vanHanYears`                                           | Các năm đã có nội dung, kèm trạng thái xuất bản                                              |
| `vanHanYear(year)`                                      | Đủ 12 ô con giáp của một năm; ô nào còn thiếu phần gì (`LUU_NIEN`, `LUAN_GIAI`, `TUNG_TUOI`) |
| `vanHanEditor(year, zodiacOrder)`                       | Bài đang có, bài cùng con giáp của năm trước, và các năm sinh hợp lệ kèm can chi, mệnh, tuổi |
| `saveVanHanEntry(input)`                                | Ghi đè theo `(zodiacOrder, year)`                                                            |
| `publishVanHanYear(year)` / `unpublishVanHanYear(year)` | Chỉ xuất bản được khi đủ 12 con giáp và mỗi con giáp đủ ba phần                              |

Một ô **đủ nội dung** khi có lưu niên, đủ 4 mục luận giải có chữ, và ít nhất một năm sinh có đủ luận Nam và Nữ.

## Sang năm mới làm gì

1. Console → **Vận hạn** → chọn năm kế tiếp trong ô chọn năm (năm hiện tại và năm sau luôn có sẵn).
2. Bấm **Soạn** ở từng con giáp. Nút **Chép từ năm …** đổ bài năm trước vào form để sửa lại; chưa bấm Lưu thì chưa ghi gì.
3. Lưu lúc nào cũng được khi năm còn là bản nháp, kể cả khi mới viết một nửa.
4. Đủ 12/12 thì bấm **Xuất bản năm …**. Trang công khai chuyển sang năm mới ngay.
5. Muốn quay lại thì **Gỡ xuất bản**: trang công khai về năm đã xuất bản gần nhất trước đó.

## Phiên console tự làm mới

Access token của console sống 15 phút, còn console trước đây không gọi `/api/admin/auth/refresh-token`, nên soạn lâu rồi bấm Lưu sẽ bị 401. `graphqlRequest` giờ làm mới phiên một lần khi GraphQL trả mã 401 rồi gửi lại request. Làm mới không được thì trang soạn giữ nguyên nội dung và nói rõ phiên đã hết hạn, không chuyển hướng.

## Chưa làm

| Việc                                 | Ghi chú                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI soạn nội dung                     | Trang soạn có nút đang khoá. Chưa có plan; khi làm thì kết quả chỉ đổ vào form để duyệt, không ghi thẳng DB, và năm sinh / can chi / mệnh vẫn do server tính                                                         |
| Lịch sử phiên bản                    | Lưu đè là mất bản cũ. Nên có trước khi cho AI viết lại bài đang công khai                                                                                                                                            |
| Xem nhiều năm trên trang công khai   | Hiện chỉ có năm đã xuất bản mới nhất                                                                                                                                                                                 |
| Nhật ký thao tác của admin           | Lưu và xuất bản chưa ghi vào `activity_log`; thuộc phần "sự kiện do admin thao tác" của [10-activity-log.md](10-activity-log.md)                                                                                     |
| Lỗi validate lồng nhau mất đường dẫn | [08-rest-contract.md](08-rest-contract.md) mục 1 áp dụng cho `saveVanHanEntry`: lỗi ở `luanGiai[0].body` về với khoá `body`. Form của console đã chặn trước các giới hạn này nên hiếm khi gặp, nhưng vẫn là nợ chung |
