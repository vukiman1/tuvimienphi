# Thông báo deploy và theo dõi container

Hai kênh độc lập gửi về Zalo qua Zalo Bot Platform (`tools/notify-zalo.sh`). Dựng sau một sự cố backend chết ba ngày mà không ai biết: CI đã đỏ, chỉ là không ai nhìn.

---

## Vì sao hai kênh

Có hai loại sự cố, và mỗi kênh chỉ thấy một loại.

**CI thấy được**: deploy hỏng. Workflow đỏ ngay lúc đó.

**CI không bao giờ thấy**: container tự chết lúc 3 giờ sáng. Không có gì kích hoạt workflow nào cả. Với `restart: unless-stopped`, một container crash-loop sẽ tự khởi động lại mãi mãi mà không ai hay.

Kênh thứ hai phải chạy **ngoài** thứ nó theo dõi. Một tiến trình đã chết không báo được là mình đã chết — nên nó không thể là một job trong queue của chính backend.

## Kênh 1 — từ CI

Bước cuối của `.github/workflows/deploy-backend.yml`, `if: always()` nên chạy cả khi deploy hỏng. Nội dung: trạng thái, commit ngắn + tiêu đề, image tag, người kích hoạt, link tới run.

**Báo cả thành công lẫn thất bại.** Deploy chỉ chạy khi merge vào `dev` nên lưu lượng rất thấp, không thành nhiễu. Quan trọng hơn: có tin báo thành công thì "im lặng" mới thực sự có nghĩa — không lẫn giữa "không sao" và "bộ báo hỏng".

Bước này `continue-on-error: true`, để Zalo chết không làm một lần deploy thành công hiện màu đỏ. Đổi lại bộ báo hỏng sẽ khó thấy — kênh 2 là lưới đỡ cho chuyện đó.

Thiếu secret thì workflow ghi một dòng `::warning::` chứ không đỏ.

## Kênh 2 — từ VPS

`tools/vps/watch-containers.sh`, chạy 5 phút một lần qua systemd timer. Theo dõi `backend`, `worker`, `db`, `redis` — nhưng chỉ những service mà compose thực sự khai báo, nên nó không báo động về `worker` ở phiên bản chưa có service đó.

Bốn tình huống nó phân biệt:

| Trạng thái    | Nghĩa                                                             |
| ------------- | ----------------------------------------------------------------- |
| `missing`     | Container không tồn tại — đúng tình huống deploy bỏ dở giữa đường |
| `unhealthy`   | Healthcheck đang đỏ                                               |
| `stopped`     | Container có nhưng không chạy                                     |
| khởi động lại | `RestartCount` tăng — crash-loop, dù hiện tại đang `healthy`      |

Tình huống cuối là lý do không chỉ đọc health status: một container OOM rồi tự lên lại sẽ luôn báo `healthy` đúng lúc ta hỏi, nhưng `RestartCount` thì không nói dối.

**Chỉ báo khi trạng thái đổi**, so với `.watch-state` trong thư mục deploy. Cron 5 phút mà báo mỗi lần chạy thì sau một đêm sẽ bị tắt, và thế là mất hẳn tác dụng.

Lần chạy đầu tiên gửi một tin xác nhận đã bắt đầu theo dõi, kèm trạng thái hiện tại — để biết bộ báo hoạt động thật chứ không phải đang im vì hỏng.

**Chỉ báo, không tự chữa.** `restart: unless-stopped` đã lo việc khởi động lại; thêm tự chữa nữa chỉ giấu vấn đề đi.

## Script tự cập nhật theo deploy

`deploy-backend.sh` tải `tools/notify-zalo.sh` và `tools/vps/watch-containers.sh` từ đúng commit đang deploy, cùng cơ chế nó vốn dùng cho `docker-compose.prod.yml`. Nên hai script không bao giờ lệch phiên bản với code — một bộ theo dõi cũ âm thầm là loại hỏng tệ nhất.

Nếu commit đang deploy chưa có hai file đó (rollback về bản cũ) thì deploy **vẫn chạy bình thường** và giữ nguyên bản đang có trên đĩa. Một bản theo dõi hơi cũ vẫn tốt hơn một lần rollback bị chặn.

## Cài trên VPS

Tạo bot bằng tài khoản Zalo cá nhân, không cần OA riêng: trong Zalo tìm OA **Zalo Bot Manager** → "Tạo bot". Token được gửi về qua tin nhắn; tạo lại token ở `https://zalo.me/s/botcreator/` nếu nó bị lộ.

Token và chat id nằm trong `prod.enc.env` (xem `docs/prod-env.md`), nên cả hai kênh đọc cùng một chỗ: job deploy đọc từ file vừa giải mã, watcher đọc `.env` mà deploy ghi ra. Đổi phòng chat hay token là một lần `sops edit`.

Lấy `chat id`: `getUpdates` chỉ trả tin đến **trong lúc** nó đang chờ, Zalo không giữ tin cũ. Chạy lệnh dưới rồi nhắn cho bot một câu trong vòng 30 giây; `chat id` nằm ở `result.message.chat.id`. Muốn cả nhóm cùng nhận thì thêm bot vào nhóm và nhắn trong nhóm.

```bash
curl -s -X POST "https://bot-api.zaloplatforms.com/bot<TOKEN>/getUpdates" \
  -H 'Content-Type: application/json' -d '{"timeout":30}'
```

Mỗi tin tối đa 2000 ký tự; `notify-zalo.sh` cắt phần thừa.

Systemd chỉ phải cài một lần:

Deploy chỉ tải script, không tải unit file, nên chép unit từ repo trên máy mình:

```bash
for unit in tuvimienphi-watch.service tuvimienphi-watch.timer; do
  ssh root@<vps> "cat > /etc/systemd/system/$unit" < "tools/vps/$unit"
done
ssh root@<vps>
sudo systemctl daemon-reload
sudo systemctl enable --now tuvimienphi-watch.timer
systemctl list-timers tuvimienphi-watch.timer
```

Chạy thử một lần bằng tay:

```bash
sudo systemctl start tuvimienphi-watch.service
journalctl -u tuvimienphi-watch.service -n 20
```

Lần đầu sẽ nhận một tin Zalo liệt kê trạng thái mọi container. Nếu lần đầu chạy lúc chưa có token thì tin đó mất; xoá `/opt/tuvimienphi/.watch-state` để nó gửi lại.

## Còn hở

**Bộ theo dõi không tự theo dõi nó.** Nếu timer bị tắt hoặc script lỗi, không có gì báo. `systemctl list-timers` cho biết nó còn sống; kênh 1 phần nào bù được vì deploy vẫn báo.

**Không có ngưỡng lặp lại.** Một container chớp tắt liên tục sẽ gửi tin mỗi 5 phút. Nếu thành nhiễu thì thêm thời gian im lặng sau mỗi lần báo — chưa làm vì chưa gặp.

**Nội dung tin không dấu.** Giữ ASCII để khỏi phụ thuộc vào locale của shell trên VPS.
