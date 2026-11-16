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

## Frontend và dashboard trên Cloudflare Workers

Từ 2026-11-16 frontend và dashboard chạy trên Cloudflare Workers (static assets), không còn trên Vercel. Workflow `Deploy Web Apps` chạy sau khi `Push to dev` xanh (hoặc chạy tay cho một commit trên `dev`), build và prerender trên GitHub Actions, rồi `wrangler deploy` hai Worker:

- `xemtuvimienphi.top` → Worker `tuvimienphi-frontend`.
- `dashboard.xemtuvimienphi.top` → Worker `tuvimienphi-dashboard`.
- `www.xemtuvimienphi.top` được redirect rule của Cloudflare chuyển 301 về apex.

DNS và Workers Custom Domains đều quản lý trong Cloudflare (`routes` với `custom_domain: true` trong `wrangler.jsonc`). `workers_dev` tắt nên bản production không có địa chỉ `*.workers.dev`; `preview_urls` bật cho preview PR (xem dưới).

Job cuối `notify Zalo` gửi một tin gộp cả hai app, báo cả thành công lẫn thất bại, kèm số trang đã prerender; token Zalo lấy từ `prod.enc.env`, Zalo lỗi cũng không làm workflow đỏ. Workflow này chạy song song với `Deploy Backend`, nên prerender có thể gặp lúc backend đang khởi động lại: mỗi lời gọi API trả 5xx hoặc lỗi mạng được thử lại sau 5, 10, 20, 40, 60 giây (`apps/frontend/tools/retry-transient.mjs`) trước khi tính là hỏng.

- `apps/frontend/wrangler.jsonc`: thư mục `dist` là static assets; đường dẫn không có file thì Worker trả `spa-shell.html`.
- `apps/frontend/worker/index.ts`: chuyển `/api/*` sang `https://api.xemtuvimienphi.top`.
- `apps/dashboard/wrangler.jsonc` + `worker/index.ts`: như frontend, thêm chuyển `/` sang `/admin` và trả `index.html` cho mọi đường dẫn khác.
- `public/_headers` của cả hai app: cache `immutable` cho `/assets/*`.

Token nằm trong `cloudflare.enc.env`, mã hoá cùng khoá với `prod.enc.env` nhưng tách riêng để không bị ghi lên VPS:

| Key                     | Lấy ở đâu                                                    |
| ----------------------- | ------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | My Profile → API Tokens → template "Edit Cloudflare Workers" |
| `CLOUDFLARE_ACCOUNT_ID` | Dashboard → Workers & Pages → Account ID (cột phải)          |

```bash
sops edit cloudflare.enc.env
```

## Theo dõi uptime từ ngoài VPS

`watch-containers.sh` và `notify-zalo.sh` chạy trên chính VPS, nên VPS chết thì không ai được báo. Worker `tuvimienphi-uptime` (`apps/uptime-monitor`) chạy trên Cloudflare bằng Cron Trigger, 5 phút một lần:

- `GET https://api.xemtuvimienphi.top/health/readiness`, timeout 10 s. Không phải 2xx, quá giờ hoặc lỗi mạng đều tính là hỏng.
- Chỉ báo khi trạng thái đổi: hỏng **2 lần liên tiếp** mới gửi tin "không phản hồi" (lỗi + giờ Việt Nam bắt đầu hỏng), sống lại thì gửi một tin "đã hoạt động lại" kèm thời gian gián đoạn. Hỏng mãi hay sống mãi thì im lặng.
- Trạng thái lần trước (kèm thời điểm, số lần hỏng liên tiếp) nằm trong Workers KV, binding `UPTIME_STATE`.
- `ZALO_BOT_TOKEN`, `ZALO_CHAT_ID` là Worker secret, lấy từ `prod.enc.env` — cùng giá trị VPS dùng. Workflow `Deploy Uptime Monitor` giải mã `cloudflare.enc.env` + `prod.enc.env`, chạy `wrangler deploy` rồi `wrangler secret put` qua stdin. Workflow chạy khi `dev` có thay đổi trong `apps/uptime-monitor/**`, chính workflow, `prod.enc.env` hoặc `cloudflare.enc.env` — đổi token Zalo thì Worker tự nhận bản mới — hoặc chạy tay.

Làm một lần trước lần deploy đầu tiên: tạo KV namespace rồi thay `replace-with-kv-id` trong `apps/uptime-monitor/wrangler.jsonc` bằng id vừa nhận. Workflow dừng với lỗi nếu id vẫn là placeholder.

```bash
cd apps/uptime-monitor && npx wrangler@4.162.0 kv namespace create UPTIME_STATE
```

## Preview cho PR

Mỗi PR vào `dev` (từ nhánh trong repo) chạy workflow `PR Preview`: build như production, rồi `wrangler versions upload --preview-alias pr-<số>` cho cả hai app, không đụng bản production. Bot comment link `https://pr-<số>-tuvimienphi-frontend.anvuit734.workers.dev` và bản dashboard vào PR. `robots.txt` của preview là `Disallow: /`.

Preview gọi API production (đọc là dữ liệu thật, ghi là ghi thật) và không đăng nhập được trên `workers.dev`.

Job dùng environment `cloudflare-preview`, không phải `vps-sieu-toc-production`: secret `SOPS_AGE_KEY` ở đó là một khoá age riêng chỉ mở được `cloudflare-preview.enc.env`, trong đó là token Cloudflare chỉ có quyền Workers Scripts. Code trong PR vì vậy không đọc được secret production.

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

## Cloudflare AI Gateway cho Gemini

Khi bật, mọi lời gọi Gemini của backend (sinh luận giải, liệt kê model trong dashboard) đi qua gateway `tuvimienphi` của Cloudflare thay vì gọi thẳng Google. Gateway ghi lại từng request: log, độ trễ, số token và chi phí ước tính mỗi lần gọi, xem ở Dashboard → AI → AI Gateway → `tuvimienphi`. Key Gemini vẫn lấy từ dashboard admin như cũ, gateway chỉ đứng giữa.

| Key                   | Giá trị                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| `AI_GATEWAY_BASE_URL` | `https://gateway.ai.cloudflare.com/v1/<account_id>/tuvimienphi/google-ai-studio` (https) |
| `AI_GATEWAY_TOKEN`    | Token của gateway (gateway bật authentication), gửi qua header `cf-aig-authorization`    |

Bật: `sops edit prod.enc.env`, điền cả hai key, mở PR vào `dev`, merge. Chỉ điền một trong hai thì backend và worker không khởi động được (log ghi rõ phải điền cả hai hoặc không điền key nào). Migration không đọc hai key này nên vẫn qua, container cũ đã bị thay: deploy đỏ ở bước chờ healthy và API sập cho tới khi sửa file, nên kiểm tra kỹ trước khi merge.

Tắt / rollback: để trống cả hai giá trị (`AI_GATEWAY_BASE_URL=`, `AI_GATEWAY_TOKEN=`) rồi merge. Backend gọi thẳng Google như trước. Đừng xoá hẳn dòng: hai key nằm trong `.env.prod.example` nên deploy sẽ dừng nếu `prod.enc.env` thiếu chúng.

## Lưu ý

- **`POSTGRES_PASSWORD`**: đổi trong file không đổi mật khẩu của database đang chạy — Postgres chỉ đọc biến này lúc khởi tạo volume. Chạy `ALTER USER ... PASSWORD ...` trước, rồi mới sửa file.
- Biến `VITE_*` của frontend và dashboard nằm trong workflow `Deploy Web Apps`, không ở đây.
