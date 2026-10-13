# Activity Log

Nhật ký hoạt động query được, để console trả lời "lúc mấy giờ ai làm gì". Đợt này chỉ phục vụ một khối trên trang Tổng quan.

---

## Bối cảnh

`AuthAuditService` đã tồn tại và đã được gọi ở **16 điểm** trong luồng auth, với đủ ngữ cảnh (`userId`, `email`, `jti`, IP, user-agent). Đây chính là mục 9 của [04-infra-scaling.md](04-infra-scaling.md) — coi như đã xong phần "log có cấu trúc".

Nhưng thân hàm `record()` chỉ có `this.logger.log(...)`. Không ghi bảng nào. Hệ quả: mọi sự kiện auth **không để lại dòng nào trong DB**, mất khi restart, không query được.

Cái gì đã có dấu vết trong DB:

| Sự kiện         | Nguồn                        |
| --------------- | ---------------------------- |
| Đăng nhập       | `user_sessions.created_at`   |
| Hoạt động cuối  | `user_sessions.last_seen_at` |
| Xem lá số       | `la_so_history.viewed_at`    |
| Đăng ký         | `users.created_at`           |
| Liên kết Google | `auth_identities`            |

Cái gì **chỉ** có trong dòng log: đăng xuất · đăng xuất tất cả · đăng nhập thất bại · 2FA sai · đổi mật khẩu · quên/reset mật khẩu · bật/tắt 2FA · dùng mã khôi phục · xác thực email · refresh token.

Với console admin, "đăng nhập thất bại" và "đổi mật khẩu" là hai dòng đáng giá nhất — chúng là thứ để phát hiện tài khoản bị dò. Cả hai đang rơi xuống log.

## Phạm vi

**Trong đợt này:** bảng `activity_log` · ghi sự kiện auth (16 loại) và xem lá số · backfill lá số · một root field GraphQL · một khối trên trang Tổng quan.

**Không thuộc đợt này:** trang chi tiết user và tab hoạt động theo user · sự kiện luận giải · sự kiện do admin thao tác · dọn log định kỳ · feed cho người dùng cuối.

---

## 1. Bảng

```sql
CREATE TABLE activity_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at timestamptz  NOT NULL DEFAULT now(),
  event       varchar(64)  NOT NULL,
  user_id     uuid NULL REFERENCES users(id) ON DELETE SET NULL,
  actor_email varchar(255) NULL,
  ip_address  varchar(255) NULL,
  user_agent  text NULL,
  metadata    jsonb NULL
);
CREATE INDEX idx_activity_log_occurred_at      ON activity_log (occurred_at DESC);
CREATE INDEX idx_activity_log_user_occurred_at ON activity_log (user_id, occurred_at DESC);
```

`occurred_at` tách khỏi thời điểm insert: dòng backfill mang mốc thời gian lịch sử, không phải lúc chạy migration.

`ON DELETE SET NULL` chứ không CASCADE. Nhật ký bị xoá theo chính đối tượng nó ghi lại thì mất tác dụng điều tra. `actor_email` là bản chụp lúc ghi — đó là thứ còn lại sau khi `user_id` thành NULL.

Entity **không kế thừa `BaseEntity`**. Đây là lệch chuẩn cố ý: bảng chỉ ghi thêm, không gì cập nhật và không gì xoá mềm, nên `updated_at` và `deleted_at` sẽ là hai cột không bao giờ dùng.

**PII:** bảng giữ email và IP. Ràng buộc "không log token/secret/PII nhạy cảm" của mục 9 vẫn được tôn trọng — không ghi token, không ghi mật khẩu, không ghi mã 2FA. Email và IP đã nằm sẵn trong `users` và `user_sessions`, và admin vốn đã xem được cả hai ở trang Người dùng.

## 2. Đường ghi

Nguyên tắc: **nhật ký không bao giờ được làm hỏng thứ nó quan sát.**

`AuthAuditService.record()` giữ nguyên chữ ký `(): void`. Thân hàm giữ `logger.log()` và thêm một insert không chờ:

```ts
void this.repo.insert(row).catch((error) => this.logger.error({ event, error }));
```

Nhờ vậy **16 chỗ gọi không đổi một dòng nào**, đăng nhập không chờ thêm round-trip DB, và insert hỏng thì đăng nhập vẫn chạy. Đánh đổi đã biết: process chết đúng thời điểm đó thì mất sự kiện. Chấp nhận được cho một feed hoạt động; sẽ **không** chấp nhận được nếu sau này bảng này phục vụ mục đích tuân thủ pháp lý — lúc đó phải đổi sang ghi đồng bộ trong transaction.

Lỗi được log chứ không bị nuốt.

`metadata` cho sự kiện auth giữ `jti` khi có. **Không** đưa vào đó token, mật khẩu, mã 2FA hay mã khôi phục.

**Lá số:** thêm lời gọi trong `LaSoHistoryService.record()`. Sự kiện `la-so.viewed`, `metadata` giữ `fullName` và ngày sinh.

> **Không ghi từ `LaSoHistoryService.sync()`.** `sync()` là đồng bộ hàng loạt từ localStorage của client và mang `viewedAt` lùi về quá khứ. Ghi từ đó thì mỗi lần client đồng bộ là feed ngập dòng lùi ngày.

Nhãn là "xem lá số", không phải "tạo". `la_so_history` upsert theo `(userId, birthKey)` nên không cho biết rẻ tiền rằng đây là lần đầu hay lần thứ n. Muốn phân biệt phải thêm một truy vấn kiểm tra tồn tại, hoặc viết lại upsert thành SQL thô có `RETURNING xmax = 0`.

## 3. Migration

Một file trong `apps/backend/src/migrations/`, hai việc: tạo bảng, rồi backfill từ `la_so_history` với `occurred_at = viewed_at` và `event = 'la-so.viewed'`.

> **Backfill không phải lịch sử đầy đủ.** `la_so_history` upsert theo `(userId, birthKey)`, nên mỗi lá số chỉ có **một** dòng mang lần xem _gần nhất_ — xem lại không sinh dòng mới. `HISTORY_LIMIT = 200` còn cắt bớt phần cũ mỗi user. Backfill vì vậy cho ra "lần xem gần nhất của mỗi lá số, tối đa 200 mỗi user", không phải mọi lượt xem từng xảy ra.

Auth không backfill được: quá khứ chỉ tồn tại trong dòng log.

## 4. API

```graphql
type ActivityEntry {
  id: ID!
  occurredAt: String!
  event: String!
  userId: ID
  actorEmail: String
  actorName: String
  ipAddress: String
}

recentActivity(limit: Int): [ActivityEntry!]!
```

`actorName` lấy từ `users.display_name` qua `LEFT JOIN` theo `user_id` — NULL khi user đã bị xoá, lúc đó UI rơi về `actorEmail`. `userAgent` và `metadata` **không** trả ra đợt này: khối Tổng quan không hiển thị chúng, và chúng là phần nặng nhất của mỗi dòng.

Đúng và chỉ đúng thứ khối Tổng quan cần. **Không** thêm sẵn `userId` hay phân trang — trang chi tiết user không thuộc đợt này, và thêm tham số cho nhu cầu chưa tồn tại là thứ [CLAUDE.md](../../CLAUDE.md) cấm. Lúc cần thì thêm, là việc nhỏ.

`ActivityEntry` trả `event` dưới dạng chuỗi thô. Dashboard tự map sang nhãn tiếng Việt.

`limitQueryShape` giới hạn `MAX_ROOT_FIELDS = 5` **trên mỗi operation**, không phải trên toàn schema, nên thêm root field không ăn vào hạn mức đó. Cảnh báo ngược lại trong [09-admin-metrics.md](09-admin-metrics.md) là báo động giả.

## 5. Khối trên Tổng quan

Một `Card` cuối trang, `List` khoảng 15 dòng: thời gian tương đối, tên hoặc email, câu mô tả.

Bảng nhãn nằm ở dashboard. Gặp `event` không có trong bảng thì **hiện nguyên chuỗi**, không bỏ trống — sự kiện mới thêm ở backend sẽ vẫn đọc được trước khi ai đó kịp thêm nhãn.

## 6. Test

Backend:

- `record()` insert đúng hình dạng, có `occurred_at`, `actor_email`, IP, user-agent.
- **Insert hỏng không ném ra ngoài.** Đây là điều kiện sống còn của cách ghi ở mục 2 — nếu test này đỏ thì đăng nhập đang phụ thuộc vào nhật ký.
- `sync()` không sinh activity.
- Truy vấn đọc tôn trọng `limit` và sắp xếp mới nhất trước.

Dashboard:

- Mỗi giá trị `AuthEvent` đều có nhãn.
- `event` lạ rơi về chuỗi gốc chứ không thành dòng trống.

## Rủi ro đã biết

| Rủi ro                                | Xử lý                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| Bảng phình vô hạn                     | Chấp nhận trong đợt này. Backend chưa có cron nào; thêm cơ chế dọn là việc riêng |
| Mất sự kiện khi process chết          | Chấp nhận — đánh đổi của cách ghi không chờ, đã nêu ở mục 2                      |
| `AuthEvent` thêm loại mới, thiếu nhãn | UI hiện chuỗi thô; test nhãn sẽ đỏ khi thiếu                                     |
