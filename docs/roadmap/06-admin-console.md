# Admin Console — Backend

Dựng API cho `apps/dashboard`. Hiện console chạy hoàn toàn bằng dữ liệu giả và **không có lớp bảo vệ nào**.

---

## Quyết định kiến trúc

**Chung ở tầng danh tính, tách ở tầng phiên.**

| Tầng         | Quyết định                                                                   | Vì sao                                                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bảng dữ liệu | **Không** tách bảng admin. Giữ cột `role` trên `users`                       | Admin là cùng một người dùng site. Tách bảng phải nhân đôi 5 bảng vệ tinh (`user_sessions`, `user_totp`, `user_recovery_codes`, `auth_identities`, `la_so_history`) và 19 file gõ theo `UserEntity` |
| Xác thực     | Dùng chung mật khẩu / 2FA / khoá tài khoản / nhật ký                         | Hai bản sao của luồng credential sẽ trôi lệch nhau — đó mới là lỗ hổng                                                                                                                              |
| Phiên        | **Tách**: tên cookie riêng, TTL riêng, namespace Redis riêng, guard theo vai | Cùng tên cookie + cùng domain = cùng một phiên: đăng nhập console sẽ ghi đè phiên trang công khai                                                                                                   |
| Khoá ký JWT  | **Không** tách secret                                                        | Cùng một dòng `users`, guard vẫn phải đọc vai từ DB mỗi request. Muốn chắc thì thêm claim `aud`, rẻ hơn nhiều so với xoay hai bộ khoá                                                               |

**Khi nào xét lại việc tách bảng:** admin trở thành nhân sự (có nhận việc / nghỉ việc, không tự đăng ký), số admin lên vài người, hoặc cần chính sách đăng nhập khác hẳn. Bước trung gian là bảng cấp quyền chỉ-ghi-thêm (`userId`, `grantedBy`, `grantedAt`) thay cột `role`.

### Vì sao phải có hạn tuyệt đối

Cookie `access_token` sống 15 phút, nhưng refresh token **không nằm ở trình duyệt** — nó ở Redis, và cookie `sub` (bản mã hoá `{id, jti, persistence}`) là thứ dùng để đổi token mới. Nên:

- Mất riêng `access_token` → 15 phút rồi hết, không refresh được.
- Mất `sub` → chiếm phiên. Và vì `rotateSession` cấp lại **trọn** TTL mỗi lần làm mới (cửa sổ trượt), kẻ trộm chỉ cần refresh đều đặn là phiên sống vô hạn.
- Client không bao giờ cầm refresh token → **không thể phát hiện dùng trùng** (reuse detection). Người thật và kẻ trộm nhìn giống hệt nhau từ phía máy chủ.

Hạn tuyệt đối là thứ duy nhất chặn được chuyện đó mà không cần ai phát hiện ra.

---

## Trạng thái dữ liệu của console

Cả 5 query trong `apps/dashboard/src/features/admin/data/queries.ts` đều là `setTimeout(320ms)` trên hằng số. Không có một lời gọi mạng nào trong app. **Không có một `useMutation` nào** — mọi nút ghi đều là trang trí (submit của ba dialog soạn thảo chỉ `preventDefault()` rồi đóng; công tắc bật/tắt là `<Switch defaultChecked>` không handler; "Khoá tài khoản" chỉ đóng dialog).

| Trang      | Dữ liệu thật?                                                                             |
| ---------- | ----------------------------------------------------------------------------------------- |
| Người dùng | ✅ `users` + `la_so_history` + `user_sessions.lastSeenAt`                                 |
| Vận hạn    | ⚠️ Có bảng `van_han` nhưng **khác mô hình** (xem dưới)                                    |
| Tổng quan  | ⚠️ Chỉ vài số đếm là thật; lượt xem / nguồn truy cập / tỉ lệ chuyển đổi **không có bảng** |
| Blog       | ❌ Không có bảng, không có module, không có controller                                    |
| Quảng cáo  | ❌ Không lưu redirect, popup, click, impression ở đâu cả                                  |

**Xung đột mô hình vận hạn:** dashboard khoá theo **tuổi** với một `star`, enum `cát|bình|hung`, một `summary`, cờ `published`. Bảng `van_han` thật khoá theo `(zodiacOrder, year)`, có `luanGiai` là jsonb các khía cạnh với `rating` kiểu **số**, `tungTuoi` theo năm sinh, `bornYears`, `luuNien`. Không có `star`, không có `published`, không có dòng theo tuổi. Phải thiết kế lại trang theo bảng thật, **không** viết API chiều theo mock.

**Cột còn thiếu:** `users` không có trạng thái `active|inactive|banned`, nên nút "Khoá tài khoản" chưa có chỗ ghi. `credits` của mock ứng với `users.balance`, nhưng bảng còn cột `token` — phải chọn một hoặc dashboard cần hai trường. `GenRecord.kind` có `van-han` / `ngay-tot` nhưng `la_so_history` chỉ ghi lượt xem lá số.

---

## 1. 🔴 Hạn tuyệt đối cho phiên

**Vấn đề:** `rotateSession` cấp lại trọn TTL mỗi lần refresh → phiên còn hoạt động thì sống mãi. Không có cách nào bắt một phiên phải kết thúc.

**Cách làm:** `createSession` ghi khoá `SESSION_START:{userId}:jti` với TTL = hạn tuyệt đối và **không bao giờ gia hạn**. `rotateSession` kiểm tra khoá đó còn không trước khi làm gì khác. Redis tự cưỡng chế — không cron, không cột DB, không sửa payload JWT.

**Mặc định tắt.** Ba khoá `session.maxLifetime*` để chuỗi rỗng → hành vi người dùng thật không đổi. Bật bằng env `SESSION_MAX_LIFETIME*`.

> ⚠️ Đặt hạn tuyệt đối = TTL refresh **không phải** "giữ nguyên hành vi". Hiện phiên STANDARD trượt vô hạn khi còn dùng; đặt hạn 1d là người dùng phải đăng nhập lại mỗi ngày. Đó là quyết định sản phẩm riêng.
>
> ⚠️ Bật lần đầu sẽ đá hết phiên đang mở một lượt: phiên tạo trước đó không có khoá `SESSION_START` nên lần refresh kế tiếp là 401.

**File liên quan:** [session.service.ts](../../apps/backend/src/api/auth/services/session.service.ts), [config/src/index.ts](../../packages/backend/config/src/index.ts), `apps/backend/config/default.yml`, `apps/backend/config/custom-environment-variables.yml`.

**Acceptance:** refresh trước hạn thì được, sau hạn thì 401 và cookie bị xoá; refresh không đẩy hạn về sau; không cấu hình hạn thì không có lời gọi Redis nào thêm.

**Tên gọi:** dùng `maxLifetime` chứ không phải `absoluteTtl` — thuật ngữ OWASP ("absolute timeout") chỉ tự giải thích với người đã biết, và cặp `refreshTtl` / `absoluteTtl` đọc lệch nhau (một cái đặt tên theo token, một cái theo chính sách). Không dùng `maxAge` vì trùng tên thuộc tính cookie ở [session-cookie.service.ts](../../apps/backend/src/api/auth/services/session-cookie.service.ts).

---

## 2. 🔴 Phiên biết mình thuộc về ai

**Vấn đề:** chỉ có một cặp cookie `access_token` / `sub` với `path: '/'`. Đăng nhập console sẽ ghi đè phiên trang công khai và ngược lại.

**Cách làm:** dùng lại `UserType = 'admin' | 'user'` sẵn có ở `interfaces/auth.interface.ts` làm audience — không đẻ thêm `SessionAudience` song song cho cùng một khái niệm. Audience quyết định tên cookie, namespace Redis, và bảng TTL.

- `CookieName` thêm cặp thứ hai; cookie admin đặt `path: '/api/admin'`.
- `SessionCookieService` nhận audience thay vì cố định một cặp.
- Cookie phát trước khi có audience không mang trường đó → coi là `'user'`; chỉ giá trị `'admin'` tường minh mới cho ra audience admin. Thiếu bước này thì lần deploy đầu đăng xuất sạch người dùng đang có.
- `loginWithGoogle` chốt cứng `'user'`, không nhận từ tham số, để không có đường nào tạo phiên admin qua OAuth.
- `AuthService.login / refreshToken / logout / sessionStatus` nhận audience từ `userType` của mixin — đường dẫn đã có sẵn ở [auth.base.controller.ts](../../apps/backend/src/api/auth/controllers/auth.base.controller.ts).
- Zset đổi thành `SESSIONS:admin:{userId}`. **Giữ `{userId}` làm hash tag**, nếu không Lua script vỡ slot trên Redis Cluster.
- `revokeAllSessions` phải quét **cả hai** namespace, nếu không "đăng xuất mọi thiết bị" bỏ sót.
- TTL admin: nhàn rỗi **4h**, tuyệt đối **12h**.

> 🔴 **Bẫy phải xử ngay trong PR này:** `audience` bắt buộc nằm **trong payload cookie đã mã hoá** và được đối chiếu với tên cookie mà nó đến. Thiếu bước này, một admin có thể chép cookie phiên người-dùng của chính mình sang ô cookie admin để thoát hạn 12h, ăn theo hạn 60 ngày.

**Acceptance:** đăng nhập console không đụng cookie trang công khai; cookie sai audience bị từ chối; hạn mức 5 phiên không đếm lẫn giữa hai bên.

---

## 3. 🔴 Xác thực vai + đường đăng nhập admin

**Vấn đề:** không có `RolesGuard`, không có `@Roles()`. `MetadataKey.ROLE`, `StrategyKey.LOCAL.ADMIN`, `StrategyKey.JWT.ADMIN` đã khai báo trong [constants](../../packages/backend/constants/src/index.ts) nhưng **không ai dùng**.

**Cách làm:**

- `RolesGuard` + decorator `@Roles()`. Guard đọc vai **từ DB**, không từ token.
- `AdminLocalStrategy` (`local_admin`): xác thực mật khẩu qua đúng đường của `UserLocalStrategy`, rồi từ chối nếu vai không phải `SUPER_ADMIN`/`ADMIN`, và **bắt buộc đã đăng ký TOTP** — chưa có thì 403, mời bật 2FA ở trang công khai trước.
- `JwtAdminStrategy` (`jwt_admin`): như bản user nhưng đọc cookie admin.
- `AuthAdminController` = `AuthBaseController('admin', StrategyKey.LOCAL.ADMIN)` tại `@Controller('/admin/auth')`. Ép `rememberMe = false`, **không có route Google** — nếu không, 60 ngày và 30 ngày sẽ vô hiệu hoá toàn bộ tính toán TTL ở mục 2.
- Sửa `getRef()` trong `auth.swagger.ts`: hiện chỉ có nhánh `'user'`, thêm admin là vỡ.

**Acceptance:** user thường gọi `/api/admin/auth/login` → 401; admin chưa bật 2FA → 403; admin đủ điều kiện → nhận cookie admin với TTL 4h.

---

## 4. 🟡 Module `admin` và endpoint thật

**Quy tắc bắt buộc:**

- Guard đặt ở **cấp controller** (`@UseGuards(AuthGuard('jwt_admin'), RolesGuard)` + `@Roles(...)`), không rải từng route — quên một cái là thủng.
- Endpoint hiện có **không đổi gì**: không đổi param, không thêm version.
- Endpoint admin **không bao giờ nhận `userId` từ query/body**. Tác động lên người dùng nào thì id nằm trong path và đã qua guard vai.
- Kiểu dữ liệu admin **không để trong `@org/shared-contracts`** — gói này đi kèm bundle công khai.
- Một DTO phân trang/lọc/sắp xếp dùng chung.

**Endpoint:**

| Endpoint                   | Nguồn                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------- |
| `GET /api/admin/users`     | `users`, phân trang + tìm kiếm + sắp xếp **phía máy chủ**                           |
| `GET /api/admin/users/:id` | Chi tiết + lịch sử lá số từ `la_so_history`, phân trang riêng                       |
| `GET /api/admin/luan-giai` | `luan_giai_chapter` — chương nào hay hỏng, `attempts`, model nào viết               |
| `GET /api/admin/van-han`   | `van_han` theo mô hình bảng thật                                                    |
| `GET /api/admin/overview`  | Chỉ số có thật: tổng người dùng, người dùng mới N ngày, số lá số, số chương đã sinh |

> ⚠️ Dashboard đang tải trọn danh sách rồi lọc/phân trang ở client (`usePagination(filtered, 8)`), và query **không nhận tham số nào**. Với dữ liệu thật là vỡ — phải sửa cùng lúc với endpoint.

**Tuỳ chọn:** migration thêm cột trạng thái vào `users` cho nút khoá tài khoản — kèm việc chặn ở đăng nhập **và** ở `rotateSession`, nếu không khoá xong người ta vẫn dùng tiếp đến hết phiên.

---

## 5. 🔴 `POST /api/van-han` đang hở

**Vấn đề:** [van-han.controller.ts](../../apps/backend/src/api/van-han/van-han.controller.ts) chỉ chặn bằng `AuthGuard(StrategyKey.JWT.USER)` → **bất kỳ ai đăng nhập** cũng ghi được nội dung vận hạn.

**Cách làm:** chuyển sang guard admin (phụ thuộc mục 3).

---

## 6. 🔴 Nối console vào API thật

**Vấn đề:** `apps/dashboard/src/routes/__root.tsx` không có `beforeLoad`, không loader, không kiểm tra gì — render thẳng `<AdminLayout>`. Và `bootstrapAuth()` là **code chết**: chỉ `features/auth/route-guards.ts` tham chiếu, mà file đó không ai import. Nên `DEV_ADMIN` trong `features/auth/bootstrap.ts` **chưa bao giờ được gán**; store đứng yên ở `{ user: null }` và giao diện chạy bằng giá trị dự phòng viết cứng. `AccessDenied` viết xong nhưng không nơi nào render.

`/admin/*` mở toang trong **mọi** bản dựng, kể cả production. Hôm nay vô hại vì dữ liệu nằm local — **phải đóng trước khi mục 4 lên production**.

**Cách làm:**

- Trang đăng nhập cho console; `beforeLoad` chặn route; xoá `DEV_ADMIN`; cập nhật `apps/dashboard-e2e/src/admin-gate.spec.ts` (bài test này đang khẳng định trạng thái mở toang là đúng).
- Thêm origin console vào `CORS_ORIGINS` trên VPS — là danh sách đọc từ env ở [configure-app.ts](../../apps/backend/src/app/configure-app.ts), không phải sửa code.
- Console phải gọi API **cùng site** với backend, nếu không cookie `sameSite: 'lax'` không được gửi kèm. Vercel rewrite `/api/*` hoặc đặt console dưới cùng domain.

---

## Thứ tự

1 → 2 → 3, rồi 4 / 5 / 6 song song. Mục 1 và 2 không đổi hành vi nhìn thấy được của trang công khai nên merge sớm ít rủi ro nhất. Mục 6 phải xong trước khi mục 4 lên production.

## Ngoài phạm vi

Blog, quảng cáo, analytics (lượt xem / nguồn truy cập / tỉ lệ chuyển đổi). Mỗi cái là một tính năng riêng cần bảng riêng và quyết định sản phẩm, không phải "dựng API cho admin".
