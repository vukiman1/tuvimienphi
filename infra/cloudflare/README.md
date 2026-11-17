# infra/cloudflare

Quản lý zone `xemtuvimienphi.top` trên Cloudflare bằng Terraform (provider `cloudflare/cloudflare` v5). Sau khi hoàn tất, mọi thay đổi Cloudflare (trừ phần Worker) đều đi qua thư mục này, không bấm tay trên dashboard.

Phần Worker (domain/route/preview của `tuvimienphi-frontend`, `tuvimienphi-dashboard`, `tuvimienphi-uptime`) **không** thuộc Terraform: nó do `apps/*/wrangler.jsonc` (`routes` + `custom_domain: true`) và workflow `Deploy Web Apps` quản. Terraform không được tạo `cloudflare_workers_custom_domain` cho các host đó.

## Bố cục

```
infra/cloudflare/
  versions.tf          provider + terraform version
  providers.tf         provider cloudflare (token qua biến)
  variables.tf         cloudflare_api_token (sensitive), account_id, zone_id, zone_name
  locals.tf            dữ liệu zone: DNS records, redirect rule, zone settings
  main.tf              gọi module dns + redirects, resource cloudflare_zone_setting
  outputs.tf
  backend.tf.example   state ở R2 (backend s3) — bật khi chuyển state lên R2
  terraform.tfvars.example
  modules/
    dns/               for_each trên map records -> cloudflare_dns_record
    redirects/         cloudflare_ruleset phase http_request_dynamic_redirect
```

Thêm một app có subdomain = thêm một mục vào `local.dns_records` (và cấu hình ingress tunnel ở đợt 2).

## Phương pháp: import, không viết tay

Giá trị trong `locals.tf` đã có sẵn những thứ biết chắc (apex/`www`/`dashboard` là `AAAA 100::` proxied; zone settings; redirect `www` → apex). Những giá trị còn phụ thuộc zone đang chạy (UUID tunnel của `api`/`logs`, DKIM Resend, TXT Google) được đánh dấu `__FILL_FROM_CF_TERRAFORMING__` — lấy từ `cf-terraforming`, không đoán.

### Yêu cầu

- `terraform` >= 1.9
- `cf-terraforming` (`brew install cloudflare/cloudflare/cf-terraforming`)
- API token Cloudflare **chỉ đọc** của bạn (Zone: DNS Read, Zone Settings Read, Dynamic Redirect Read; Account: Zero Trust Read, Tunnel Read, R2 Read, Workers KV Read, AI Gateway Read, Turnstile Read, Account Analytics Read; Zone: Bot Management Read, Email Routing Read).

### Các bước (đợt 1: DNS + redirect + zone settings)

```bash
export CLOUDFLARE_API_TOKEN="<token chỉ đọc của bạn>"
export CLOUDFLARE_ACCOUNT_ID="<account id>"
export ZONE_ID="<zone id của xemtuvimienphi.top>"

bash tools/infra/cf-import.sh
```

Script sinh config thật + lệnh import vào `infra/cloudflare/generated/` (gitignored). Sau đó:

1. Chép giá trị thật từ `generated/cloudflare_dns_record.tf` vào `locals.tf`, thay mọi `__FILL_FROM_CF_TERRAFORMING__`. Đối chiếu biểu thức redirect và danh sách zone setting với `generated/`. Với mỗi record, chép luôn hai thuộc tính dễ gây diff vĩnh viễn: `comment` (provider v5 không computed — bỏ trống thì state giữ `""` còn config gửi `null`, lệch nhau) và `ttl` (module mặc định `1`/automatic — record nào có TTL thật khác thì phải ghi đúng trong `locals.tf`).
2. `terraform init -backend=false` rồi chạy từng lệnh import, đổi địa chỉ generated sang dạng module:

   ```bash
   terraform import 'module.dns.cloudflare_dns_record.this["apex"]' "$ZONE_ID/<record_id>"
   terraform import 'module.redirects.cloudflare_ruleset.dynamic_redirect' "$ZONE_ID/<ruleset_id>"
   terraform import 'cloudflare_zone_setting.this["ssl"]' "$ZONE_ID/ssl"
   ```

3. `terraform plan` tới khi ra **No changes**. Chỉ khi đó mới coi là xong.

State đợt 1 là local trên máy bạn (chưa có `backend.tf`). Không commit `*.tfstate`, `*.tfvars`, `.terraform/`, `generated/` — đã nằm trong `.gitignore`.

### Tái tạo import trên máy khác (khi chưa có state R2)

`locals.tf` đã khớp zone đang chạy. Máy mới chưa có state nên import lại cho khớp. Tạo `terraform.tfvars` (gitignored) với token read-only của bạn + `cloudflare_account_id = "cd90142d588c7b6d177b93df1cf401ba"` + `zone_id = "6fbe9dd5311b9d129f4416b02465182a"`, rồi:

```bash
zid="6fbe9dd5311b9d129f4416b02465182a"
terraform init -backend=false -input=false

imports=(
  "module.dns.cloudflare_dns_record.this[\"apex\"]=$zid/81ce73ed3804358e268b0f2133429a14"
  "module.dns.cloudflare_dns_record.this[\"www\"]=$zid/a52f69baaadb1e5f72eb63821990ecd8"
  "module.dns.cloudflare_dns_record.this[\"dashboard\"]=$zid/ca9116f650efd48dbadfa60a3d5409b1"
  "module.dns.cloudflare_dns_record.this[\"api\"]=$zid/773ede52d099263106b9d022dd7b6be8"
  "module.dns.cloudflare_dns_record.this[\"logs\"]=$zid/24bf1bd82fc809ec174b06386783d582"
  "module.dns.cloudflare_dns_record.this[\"resend_send\"]=$zid/f6952e605fb9186903a6bd2ba9731b91"
  "module.dns.cloudflare_dns_record.this[\"resend_return\"]=$zid/dffb73640f66d29c00e1ae2e844462f3"
  "module.dns.cloudflare_dns_record.this[\"resend_dkim\"]=$zid/76666808c19d923caab9d3fa7e4e07a8"
  "module.dns.cloudflare_dns_record.this[\"google_site_verification\"]=$zid/6a0c4e9e23125b188d93fb670072e035"
  "module.redirects.cloudflare_ruleset.dynamic_redirect=zones/$zid/2850610b1433498191641f0222bc98a0"
  "cloudflare_zone_setting.this[\"ssl\"]=$zid/ssl"
  "cloudflare_zone_setting.this[\"always_use_https\"]=$zid/always_use_https"
  "cloudflare_zone_setting.this[\"automatic_https_rewrites\"]=$zid/automatic_https_rewrites"
  "cloudflare_zone_setting.this[\"brotli\"]=$zid/brotli"
  "cloudflare_zone_setting.this[\"http3\"]=$zid/http3"
  "cloudflare_zone_setting.this[\"0rtt\"]=$zid/0rtt"
  "cloudflare_zone_setting.this[\"early_hints\"]=$zid/early_hints"
  "cloudflare_zone_setting.this[\"min_tls_version\"]=$zid/min_tls_version"
)
for pair in "${imports[@]}"; do
  terraform import -input=false "${pair%%=*}" "${pair#*=}"
done

terraform plan
```

## Những chỗ import đúng hiện trạng rồi sửa sau (mỗi mục một PR riêng)

Import để `plan` ra No changes **trước**, các thay đổi dưới đây là PR tiếp theo:

- `min_tls_version` đang là `1.0` → nâng lên `1.2`.
- DNSSEC đang tắt → bật (`cloudflare_zone_dnssec`) kèm DS record ở onamae.
- `r2.dev` của bucket backup `tuvimienphi` đã tắt → Terraform phải giữ tắt (đợt 2).
- Media đang dùng `r2.dev` → chuyển sang custom domain `media.xemtuvimienphi.top`, đổi `R2_MEDIA_PUBLIC_URL` (đợt 2).

## State ở R2 + CI (Kim An cấp)

Đợt 1 dừng ở local state + `plan` sạch, kèm output `plan` trong mô tả PR. Để chạy CI và chuyển state lên R2 cần (Kim An giữ quyền ghi):

1. Tạo bucket R2 cho state + khoá R2 (Object Read & Write).
2. Đổi tên `backend.tf.example` → `backend.tf`, điền `bucket` và `endpoints.s3` (`https://<account_id>.r2.cloudflarestorage.com`). `terraform init -migrate-state`.
3. Mã hoá token ghi + khoá R2 state vào `terraform.enc.env` (SOPS), chỉ mở ở environment `vps-sieu-toc-production`. Khoá cần có: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ZONE_ID`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`.
4. Mã hoá token **chỉ đọc** + khoá R2 read vào `terraform-plan.enc.env` (cùng bộ khoá), mở ở environment `cloudflare-terraform-plan` (giống `cloudflare-preview`).
5. Thêm creation rule cho hai file vào `.sops.yaml`.

Workflow `.github/workflows/terraform-cloudflare.yml` tự chạy khi hai file đó tồn tại: PR đụng `infra/cloudflare/**` → `plan` + comment vào PR; merge vào `dev` → `apply`. Khi chưa có file, cả hai job in notice rồi thoát xanh (không chặn CI). Workflow chỉ đọc secret bootstrap `SOPS_AGE_KEY` — `tools/ci/check-workflow-secrets.sh` vẫn xanh.
