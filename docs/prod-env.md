# Env production

Mọi biến môi trường của backend production nằm trong `prod.enc.env` ở gốc repo, mã hoá bằng [SOPS](https://github.com/getsops/sops) + [age](https://github.com/FiloSottile/age). Sửa file, mở PR vào `dev`, merge — deploy tự chạy và ghi `.env` mới lên VPS. Không SSH để sửa `.env` nữa.

## Hai lớp, mỗi giá trị đúng một chỗ

| Lớp               | Chứa                                                                                                            | Ở đâu                                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 0 — bootstrap     | Chỉ những thứ cần để vào được VPS và mở lớp 1: `VPS_HOST`, `VPS_SSH_KEY`, `VPS_SSH_KNOWN_HOSTS`, `SOPS_AGE_KEY` | GitHub environment `vps-sieu-toc-production` |
| 1 — cấu hình prod | Mọi thứ còn lại, kể cả `ZALO_BOT_TOKEN`, `ZALO_CHAT_ID`                                                         | `prod.enc.env`                               |

Một giá trị chỉ được nằm trên GitHub khi nó cần để giải mã hoặc với tới `prod.enc.env`. Job `workflow-secrets` trong CI chặn mọi `secrets.X` ngoài lớp 0.

`BACKEND_IMAGE` không nằm trong file: deploy tự ghi nó.

## Sửa một giá trị

```bash
sops edit prod.enc.env
```

Lệnh mở bản giải mã trong `$EDITOR`, lưu là mã hoá lại. Rồi mở PR như mọi thay đổi khác. Diff chỉ lộ tên key và các giá trị không bí mật (`unencrypted_regex` trong `.sops.yaml`).

Merge vào `dev` → `Deploy Backend` chạy với image mới nhất đã publish, không build lại. Muốn áp lại mà không đổi gì: chạy tay workflow `Deploy Backend`.

Thêm key mới thì thêm cả vào `.env.prod.example`. Deploy so hai file và **dừng trước khi chạm VPS** nếu `prod.enc.env` thiếu key nào mà example có — xoá nhầm một dòng không làm prod mất biến.

## Deploy làm gì với file này

1. Giải mã `origin/dev:prod.enc.env` bằng `SOPS_AGE_KEY`. Luôn là bản mới nhất trên `dev`, kể cả khi deploy lại một commit cũ — rollback code dùng env mới nhất.
2. Kiểm tra đủ key, gửi lên VPS thành `.env.next` qua stdin của ssh (quyền `600`, không lọt vào log hay tham số lệnh).
3. `deploy-backend.sh` chạy migration với `.env.next`. Thành công mới ghi `BACKEND_IMAGE` rồi đổi tên thành `.env` và recreate container. Hỏng thì `.env` cũ và container cũ giữ nguyên.

Chưa có `prod.enc.env` trên `dev` thì bỏ qua cả ba bước, deploy dùng `.env` đang có trên VPS.

Không giải mã được (thiếu hoặc sai `SOPS_AGE_KEY`) thì job đỏ và không có tin Zalo, vì token nằm trong chính file đó. GitHub vẫn báo workflow fail qua email / app: bật ở Settings → Notifications → Actions.

## Khoá

| Khoá    | Nửa bí mật ở đâu                                                                                                                | Dùng cho    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Cá nhân | macOS: `~/Library/Application Support/sops/age/keys.txt`, Linux: `~/.config/sops/age/keys.txt` + một bản trong password manager | `sops edit` |
| CI      | Secret `SOPS_AGE_KEY` của environment `vps-sieu-toc-production`                                                                 | Job deploy  |

Mất cả hai là mất file — bản trong password manager là bản dự phòng duy nhất.

Thay khoá CI:

1. `age-keygen -o ci.key`
2. Thay public key thứ hai trong `.sops.yaml` bằng kết quả của `age-keygen -y ci.key`.
3. `sops updatekeys prod.enc.env`
4. `gh secret set SOPS_AGE_KEY --env vps-sieu-toc-production < ci.key && rm ci.key`
5. Mở PR với `.sops.yaml` và `prod.enc.env`.

Thêm một người được sửa: thêm public key của họ vào `.sops.yaml`, chạy `sops updatekeys prod.enc.env`, mở PR.

## Lưu ý

- **`POSTGRES_PASSWORD`**: đổi trong file không đổi mật khẩu của database đang chạy — Postgres chỉ đọc biến này lúc khởi tạo volume. Chạy `ALTER USER ... PASSWORD ...` trước, rồi mới sửa file.
- Env của frontend và dashboard nằm trên Vercel, không ở đây.
