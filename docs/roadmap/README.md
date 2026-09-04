# Roadmap

Danh sách việc cần triển khai sau. Mỗi mục có file chi tiết riêng trong thư mục này.

Quy ước ưu tiên: 🔴 nên làm sớm (bảo mật) · 🟡 nên làm (chất lượng) · 🟢 nice-to-have.

## Auth

| #   | Việc                                         | Ưu tiên | Loại      | Chi tiết                                                     |
| --- | -------------------------------------------- | ------- | --------- | ------------------------------------------------------------ |
| 1   | Bịt account enumeration ở login              | 🔴      | Hardening | [01-auth-hardening.md](01-auth-hardening.md)                 |
| 2   | Siết password policy (DTO)                   | 🟡      | Hardening | [01-auth-hardening.md](01-auth-hardening.md)                 |
| 3   | Bỏ fallback secret hardcode (fail-fast)      | 🟡      | Hardening | [01-auth-hardening.md](01-auth-hardening.md)                 |
| 4   | Forgot / reset password                      | 🟡      | Feature   | [02-auth-account-lifecycle.md](02-auth-account-lifecycle.md) |
| 5   | Email verification                           | 🟡      | Feature   | [02-auth-account-lifecycle.md](02-auth-account-lifecycle.md) |
| 6   | Change password endpoint (+ hash khi update) | 🟢      | Feature   | [02-auth-account-lifecycle.md](02-auth-account-lifecycle.md) |
| 7   | Unit test SessionService / CryptoService     | 🟡      | Test      | [03-auth-tests.md](03-auth-tests.md)                         |
| 8   | Redis cluster: hash-tag cho session keys     | 🟢      | Scaling   | [04-infra-scaling.md](04-infra-scaling.md)                   |
| 9   | Audit logging cho sự kiện auth               | 🟢      | Ops       | [04-infra-scaling.md](04-infra-scaling.md)                   |
| 10  | CAPTCHA cho login                            | 🟢      | Hardening | [04-infra-scaling.md](04-infra-scaling.md)                   |

## Lá số

| #   | Việc                               | Ưu tiên | Loại     | Chi tiết                   |
| --- | ---------------------------------- | ------- | -------- | -------------------------- |
| 1   | Cho đổi năm xem                    | 🔴      | Feature  | [05-la-so.md](05-la-so.md) |
| 2   | Bỏ lá số giả khi vào trang trần    | 🔴      | Fix      | [05-la-so.md](05-la-so.md) |
| 3   | Dấu âm dương của chính tinh        | 🟡      | Feature  | [05-la-so.md](05-la-so.md) |
| 4   | Nối luận giải vào lá số thật       | 🟡      | Feature  | [05-la-so.md](05-la-so.md) |
| 5   | Lưu và xem lại lá số               | 🟡      | Feature  | [05-la-so.md](05-la-so.md) |
| 6   | Nhãn lưu niên `LN.*` và lưu tinh   | 🟢      | Engine   | [05-la-so.md](05-la-so.md) |
| 7   | Cân lượng, lai nhân cung           | 🟢      | Engine   | [05-la-so.md](05-la-so.md) |
| 8   | Hai ô miếu vượng còn trống         | 🟢      | Engine   | [05-la-so.md](05-la-so.md) |
| 9   | Lỗi lớp bắc cầu engine ↔ giao diện | 🔴      | Fix      | [05-la-so.md](05-la-so.md) |
| 10  | Dọn engine cho dễ bảo trì          | 🟡      | Refactor | [05-la-so.md](05-la-so.md) |
| 11  | Tầng `ĐV.*` lưu theo đại vận       | 🟡      | Engine   | [05-la-so.md](05-la-so.md) |

## Đã hoàn thành (ngữ cảnh)

### Engine an sao

Đối chiếu khớp 81 lá số thật của tuvi.vn trải nhiều năm xem khác nhau, luật ghi ở
[docs/algorithms/tu-vi-la-so.md](../algorithms/tu-vi-la-so.md):

- 12 cung, can cung (ngũ hổ độn), cục từ nạp âm cung Mệnh, chủ mệnh, chủ thân.
- 14 chính tinh + 83 phụ tinh, kèm miếu vượng cho cả hai nhóm.
- Tuần, Triệt, tứ hoá sinh niên, vòng Tràng Sinh.
- Đại vận + nhãn `ĐV.*`, lưu niên `LN.*`, tiểu hạn, cung tháng `Th.N`, cân lượng.
- Đổi lịch âm dương hai chiều, kiểm bằng round-trip 14.610 ngày.

### Auth

Phần session/token đã làm xong, không nằm trong roadmap này:

- Multi-device session theo `jti`, key Redis tách theo phiên.
- Allowlist AT trong Redis + revoke tức thì khi logout.
- Cookie cứng: `httpOnly` + `secure` (production) + `sameSite=lax`.
- Crypto cookie `sub`: AES-256-GCM + IV ngẫu nhiên (có auth tag).
- AT lưu **hash** trong Redis; RF lưu nguyên (cần verify khi rotate).
- Rotate RF mỗi lần refresh + sliding TTL.
- Giới hạn `MAX_SESSIONS_PER_USER` (mặc định 5), enforce **atomic** bằng Lua.
- `POST /auth/refresh-token` (không còn GET đổi state).
- `POST /auth/logout` (revoke đúng phiên theo `jti` đã xác thực) + `POST /auth/logout-all`.
- Password hash argon2 (`@BeforeInsert`), `@Exclude()` chặn lộ password.
