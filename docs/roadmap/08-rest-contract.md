# REST Contract

Hình dạng response của API REST đang được định nghĩa rải rác ở ba nơi và không nơi nào mô tả trọn vẹn:
`{statusCode, success, data}` trong `ResponseTransformInterceptor`, `{statusCode, success, errors}` trong
hai exception filter, còn `FormatResponse` ở `@org/backend-interfaces` chỉ tả nhánh thành công.

Liên quan: [06-admin-console.md](06-admin-console.md) mục 4c (phân trang REST) cũng thuộc nhóm này.

---

## 1. 🟡 Bỏ `exceptionFactory` tuỳ biến cho lỗi validate

**Vấn đề:** [app.provider.ts](../../apps/backend/src/app/app.provider.ts) ép `ValidationError[]` thành object
phẳng khoá theo tên trường. Nghe hợp lý, nhưng ba điểm hỏng:

1. **Mất đường dẫn ở DTO lồng nhau.** Hàm `validationErrors()` đệ quy rồi trả `{ [err.property]: ... }`
   với tên trường **con**, nên lỗi ở `luanGiai[0].body` về với khoá `"body"`. Hai object lồng nhau trùng
   tên trường sẽ **đè lên nhau** trong `reduce`, im lặng. `save-van-han.dto.ts` có hai chỗ
   `@ValidateNested({ each: true })` dùng tới.
2. **Chỉ báo một lỗi mỗi trường** (`Object.values(constraints)[0]`) và **chỉ nhánh con đầu tiên**
   (`children[0]`).
3. **Thông báo hiện lên là tuỳ hứng.** `extractMessage` ở
   [api-error.ts](../../packages/shared/frontend/src/api-error.ts) lấy `Object.values(errors)` rồi tìm
   chuỗi **đầu tiên** — bất kể thuộc trường nào. Gõ sai email nhưng thấy thông báo về `displayName`.

**Bản mặc định của Nest tốt hơn ở đúng chỗ (1).** `ValidationPipe.prependConstraintsWithParentProp`:

```js
constraints[key] = `${parentPath}.${error.constraints[key]}`;
```

→ sinh ra `luanGiai.0.body must be a string`, **giữ nguyên đường dẫn**. Tức bug (1) là do code tuỳ biến
tự tạo ra, không phải hạn chế cố hữu.

**Cách làm — ba thay đổi, phải đi cùng nhau:**

1. Xoá `exceptionFactory` + `validationErrors` khỏi `app.provider.ts` (bớt 22 dòng).
2. Nhánh `BadRequestException` trong `HttpExceptionFilter` lấy thẳng `payload.message` thay vì bọc cả cục,
   để `errors` là mảng chuỗi chứ không phải object có `statusCode` lặp hai tầng.
3. `extractMessage` xử lý mảng.

> ⚠️ **Xoá riêng bước 1 là hỏng.** Payload mặc định có `message` là **mảng**, nên `extractMessage` rơi
> xuống nhánh tìm chuỗi đầu tiên và trả về `"Bad Request"` — mọi lỗi validate hiện đúng hai chữ đó cho
> người dùng. Tệ hơn hiện tại.

**Rủi ro cần biết khi muốn gắn lỗi vào từng ô form sau này:** tên trường nằm **trong chuỗi** (`"email must
be an email"`), tách bằng token đầu tiên là được — tất cả message tuỳ biến hiện có đều theo quy ước
`<tên trường> ...`. Nhưng **không có gì ép buộc** quy ước đó. Ai viết `message: 'Mật khẩu quá ngắn'` thì
parse vẫn chạy, chỉ là gán lỗi cho một trường tên `"Mật"`, im lặng, không test nào bắt. Nếu làm form hiện
lỗi từng ô thì phải ghi quy ước này xuống hoặc đổi sang hình dạng `[{ field, message }]`.

**Acceptance:** gửi body sai vào `POST /api/auth/register` → người dùng thấy một thông báo validate thật
(không phải `"Bad Request"`); gửi mảng lồng nhau sai nhiều phần tử vào `POST /api/van-han` → mỗi phần tử
sai được báo riêng kèm chỉ số, không đè lên nhau.

---

## 2. 🟡 `TypeormExceptionFilter` vẫn đẩy chi tiết Postgres ra client REST

**Vấn đề:** nhánh HTTP của [typeorm-exception.filter.ts](../../packages/backend/filters/src/typeorm-exception.filter.ts) trả nguyên `exception.detail` cho mã `23505` và nguyên `exception.message` cho mọi lỗi khác:

```json
{
  "statusCode": 409,
  "success": false,
  "errors": { "code": "23505", "message": "Key (email)=(victim@example.com) already exists." }
}
```

Mỗi lần vi phạm ràng buộc duy nhất là một **oracle liệt kê tài khoản**, kèm lộ tên ràng buộc và tên cột. Với mã khác, `message` là nguyên văn lỗi Postgres (`relation "..." does not exist`).

**Nhánh GraphQL đã bịt** (ném `ConflictException` / `InternalServerErrorException` chung chung, log lỗi thật ở máy chủ). Nhánh REST giữ nguyên vì sửa là **đổi hợp đồng API đang chạy** — frontend hiện đọc `errors.message` để hiển thị.

> ⚠️ Tên test `'vẫn trả 409 kèm chi tiết cho HTTP như trước'` trong spec **hợp thức hoá** chỗ rò này. Đã đổi tên thành ghi chú nợ, nhưng hành vi thì chưa sửa — đừng đọc test đó như thiết kế có chủ đích.

**Cách làm:** sanitize nhánh HTTP giống nhánh GraphQL, và trả về một thông báo chung cho trùng khoá (`"Resource already exists"`). Kèm việc rà frontend xem chỗ nào đang dựa vào nội dung `detail`.
