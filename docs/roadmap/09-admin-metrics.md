# Admin Metrics

Số liệu cho trang Tổng quan của console. Chia theo thứ dữ liệu **hiện có**, không theo thứ muốn có.

---

## Nhóm A — lấy được ngay từ DB

Không phụ thuộc gì bên ngoài. Đây là phạm vi làm trước.

| Số liệu                  | Nguồn                                            |
| ------------------------ | ------------------------------------------------ |
| Tổng user                | `users`                                          |
| Active user theo ngày    | `user_sessions.last_seen_at`, distinct `user_id` |
| Đăng nhập hôm nay        | `user_sessions.created_at`                       |
| Người đăng nhập Google   | `auth_identities.provider = 'google'`            |
| Người đăng nhập mật khẩu | `users.password IS NOT NULL`                     |
| Lá số đã lưu             | `la_so_history`                                  |
| Thiết bị / trình duyệt   | `user_sessions.device_type`, `browser_name`      |

Tất cả gộp trong **một** root field `overview`. `limitQueryShape` giới hạn `MAX_ROOT_FIELDS = 5` và alias cũng bị tính, nên tách nhiều root field sẽ chạm trần rất nhanh.

## Nhóm B — lấy được nhưng nghĩa hẹp hơn tên gọi

Hai số dưới đây **phải ghi rõ nhãn trên UI**, nếu không sẽ bị đọc sai và dẫn tới kết luận sai.

**"Số lần vào web"** → thực chất là **số lần đăng nhập**. DB không có lượt truy cập; `user_sessions` chỉ sinh ra khi ai đó đăng nhập. Người mở trang rồi rời đi không để lại dấu vết.

**"Tổng lá số được gen"** → thực chất là **số lá số đã lưu của người đã đăng nhập**. `la-so/history` bọc `AuthGuard(StrategyKey.JWT.USER)`, nên khách vãng lai lập lá số không ghi gì. Với một site tử vi miễn phí, phần không ghi được nhiều khả năng lớn hơn phần ghi được.

## Nhóm C — chưa có dữ liệu, cần dựng hạ tầng trước

| Muốn biết                       | Vì sao chưa có                                                                                         | Cần gì                             |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| Người vào nhưng không đăng nhập | Không có bảng nào ghi lượt truy cập ẩn danh                                                            | Analytics ngoài                    |
| Token đã sử dụng                | `balance` chỉ được đọc, không nơi nào trừ; cột `token` không có code nào dùng; không có bảng giao dịch | Tính năng tiêu token + bảng sổ cái |
| Hành vi để tối ưu UI/UX         | Không có event tracking                                                                                | Analytics ngoài                    |
| Đăng nhập thất bại              | `AuthAuditService` chỉ ghi log, không có bảng audit                                                    | Bảng audit                         |

---

## Quyết định: tách làm hai hệ

**Không tự viết analytics.** Lượt truy cập ẩn danh và hành vi UI/UX là bài toán đã được giải. Self-host **Plausible** hoặc **Umami** trên VPS: nhẹ, không cookie, không cần banner đồng ý.

**Console chỉ giữ số liệu gắn với domain** — user, lá số, token, luận giải. Analytics ngoài không bao giờ biết những thứ này.

Ranh giới đó còn vá luôn nhóm B: analytics đếm lượt **dùng**, DB đếm lượt **lưu**, và chênh lệch giữa hai con số chính là tỉ lệ khách vãng lai.

## Thứ tự

1. **Nhóm A** — resolver `overview` + trang Tổng quan. Không phụ thuộc gì.
2. **Plausible/Umami trên VPS** — lấy về lượt truy cập ẩn danh và hành vi.
3. **Bảng giao dịch token** — khi làm tính năng tiêu token, không làm trước.
4. **Bảng audit** — nếu cần theo dõi đăng nhập thất bại.

## Ghi chú vận hành

`user_sessions.country` và `city` đang rỗng toàn bộ ở máy local, gần như chắc do IP là localhost nên geo-ip không phân giải được. **Chưa xác minh được trên production**, nên đừng đưa bản đồ theo quốc gia lên dashboard trước khi kiểm tra dữ liệu thật.

`luan_giai_chapter` có hai cột đáng theo dõi mà nhóm A không đụng tới: `attempts` (số lần gọi lại Gemini) và `model` (model nào thực sự phục vụ). Ở dữ liệu local, `attempts` trung bình là 2.0 và cao nhất là 3 — tức gần như mọi lần gọi đều trượt lần đầu. Đáng làm khi có người dùng thật.
