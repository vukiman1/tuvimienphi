# Worker và cron

Việc chạy nền tách khỏi API. Ghi lại để người thêm cron job đầu tiên không bước vào cái bẫy ở mục 2.

---

## 1. Hai container, một image

`backend` và `worker` chạy **cùng một image**, khác nhau đúng một biến:

| Container | `QUEUE_ROLE` | Làm gì                                           |
| --------- | ------------ | ------------------------------------------------ |
| `backend` | `producer`   | Phục vụ HTTP, `enqueue` được, **không** chạy job |
| `worker`  | `consumer`   | Chạy job và lịch định kỳ                         |

Mặc định của `QUEUE_ROLE` là `both`, nên máy local vẫn một tiến trình làm tất — không ai phải cấu hình gì để chạy `pnpm dev`.

Dùng chung image vì worker là cùng một chương trình đóng vai khác: chung entity, chung config, chung kết nối DB và Redis. Quan trọng hơn, một image ghim một tag thì hai bên **không thể lệch phiên bản** — mà chúng dùng chung database và chung hình dạng payload của job, nên producer đẩy thứ consumer chưa hiểu là loại lỗi rất khó lần. Service `migrate` vốn đã dùng lại image này theo đúng cách đó.

`BullModule.registerQueue` đăng ký ở mọi vai, nên tiến trình nào cũng `enqueue` được. Chỉ `QueueProcessor` và `QueueScheduler` mới theo vai.

Worker vẫn chạy HTTP nhưng không publish cổng, để nó có `/health/readiness` y như backend — đó là thứ `tools/vps/deploy-backend.sh` dùng để xác nhận worker đã sống, và là thứ bộ theo dõi sẽ đọc. Cái giá là worker cõng theo tầng HTTP nó không phục vụ. Nếu bộ nhớ VPS chật thì đây là chỗ cắt đầu tiên: đổi sang `NestFactory.createApplicationContext()` cho vai consumer, nhưng khi đó phải nghĩ lại healthcheck.

## 2. Cron đi qua BullMQ, không qua `@nestjs/schedule`

> **Đây là mục quan trọng nhất của tài liệu này.**

`@Cron` của `@nestjs/schedule` đăng ký ở **mọi tiến trình nạp module đó**. `backend` và `worker` cùng nạp `AppModule` từ cùng một image, nên mỗi `@Cron` sẽ chạy **hai lần**: một email báo cáo gửi hai bản, một job dọn dữ liệu chạy đua với chính nó.

Cờ `QUEUE_ROLE` **không** chặn được chuyện đó — nó chỉ quyết định việc đăng ký `QueueProcessor` và `QueueScheduler`.

Dùng job scheduler của BullMQ. Ngoài việc tránh bẫy trên, nó còn hơn ở bốn điểm:

|                  | BullMQ scheduler                                               | `@Cron`               |
| ---------------- | -------------------------------------------------------------- | --------------------- |
| Nhiều tiến trình | Redis chống trùng; `upsertJobScheduler` gọi ở đâu cũng an toàn | fire ở mọi tiến trình |
| Thất bại         | retry kèm backoff, có sẵn                                      | tự viết               |
| Khởi động lại    | trạng thái nằm ở Redis, lịch còn nguyên                        | mất, chờ lần kế       |
| Nhìn thấy được   | hiện trong bull-board                                          | chỉ có dòng log       |

`@nestjs/schedule` hiện **không** nằm trong dependencies. Nếu sau này có việc buộc phải dùng nó — thứ không nên đi qua Redis — thì phải mở rộng cờ vai để chặn cả phần scheduling, chứ không chỉ processor.

## 3. Mọi lịch đều là UTC

`SCHEDULER_TIMEZONE = 'UTC'` trong `apps/backend/src/api/queue/queue.constants.ts`, truyền tường minh vào `upsertJobScheduler`.

Khai rõ chứ không dựa vào việc container tình cờ chạy UTC: host đổi cấu hình thì lịch không lệch theo, và người đọc code biết ngay mốc giờ mà không phải đi tra.

Hệ quả cần nhớ khi viết job: **giờ trong pattern là giờ UTC**. "Báo cáo 8h sáng giờ Việt Nam" là `0 1 * * *`, không phải `0 8 * * *`. Nếu sau này cần lịch theo giờ địa phương thì đổi hằng số đó, đừng khai `tz` rời rạc ở từng job.

## 4. Thêm một cron job mới

Thêm phương thức vào `QueueService` theo khuôn `scheduleHourly()`, rồi gọi nó trong `QueueScheduler.onModuleInit()`. `QueueScheduler` chỉ tồn tại ở vai consumer nên lịch tự nhiên đăng ký đúng một chỗ.

`onModuleInit` nuốt lỗi vào logger thay vì ném: một lần Redis chập lúc khởi động không đáng làm chết cả worker. Đánh đổi là lịch có thể không được đăng ký mà tiến trình vẫn lên — lỗi nằm trong log.

## 5. Những chỗ còn hở

**Worker chết là cron chết im.** Job định kỳ cần một Worker đang chạy để thúc job delayed lên. Không có worker thì lịch không chạy và không có gì báo. Đây là lý do bộ theo dõi từ VPS đáng làm — xem [10-activity-log.md](10-activity-log.md) cho tiền lệ gần nhất về một sự cố im lặng kéo dài.

**Chỉ có một worker.** Không có dự phòng. Ở quy mô hiện tại là hợp lý, nhưng biết để khỏi bất ngờ.

**`mem_limit: 384m`** (heap 300m) là con số đặt tạm, chưa đối chiếu với RAM thật của VPS. Cron làm tổng hợp nặng trên `activity_log` hay `la_so_history` có thể chạm trần.

## 6. bull-board ở production

Đang **tắt** (`QUEUE_BOARD_ENABLED=false`). Mặc định fail-closed đúng: thiếu mật khẩu ở production thì trả 503 chứ không mở.

Nếu bật thì phải xử ba điểm trước:

- **Không có giới hạn tốc độ.** `ThrottlerGuard` là guard của Nest; bull-board gắn bằng express middleware nên guard không chạm tới. Đoán mật khẩu không giới hạn lần.
- **So sánh mật khẩu không hằng thời gian** trong `queue-board-auth.ts`. Dùng `crypto.timingSafeEqual`.
- **Nó không chỉ đọc.** Xoá, retry, promote job được, và payload job hiện nguyên trên trang — khi luận giải vào queue thì đó là ngày sinh và prompt của người dùng.

Cách được khuyên: đặt Cloudflare Access trước `/queues`. Tunnel đã là lối vào duy nhất và backend chỉ publish ở `127.0.0.1`, nên không có origin công khai để đi vòng qua cổng. Cách rẻ hơn: giữ tắt, khi cần thì mở qua SSH local-forward.
