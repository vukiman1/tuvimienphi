# infra/cloudflare

Quản lý zone `xemtuvimienphi.top` trên Cloudflare bằng Terraform (provider `cloudflare/cloudflare` v5). Sau khi hoàn tất, mọi thay đổi Cloudflare (trừ phần Worker) đều đi qua thư mục này, không bấm tay trên dashboard.

Phần Worker (domain/route/preview của `tuvimienphi-frontend`, `tuvimienphi-dashboard`, `tuvimienphi-uptime`) **không** thuộc Terraform: nó do `apps/*/wrangler.jsonc` (`routes` + `custom_domain: true`) và workflow `Deploy Web Apps` quản. Terraform không được tạo `cloudflare_workers_custom_domain` cho các host đó. Bản ghi DNS của apex và `dashboard` cũng vậy: Worker custom domain tự tạo và khoá chúng (`read_only`, `origin_worker_id`), nên chúng không nằm trong `local.dns_records`.

## Bố cục

```
infra/cloudflare/
  versions.tf          provider + terraform version
  providers.tf         provider cloudflare (token qua biến)
  variables.tf         cloudflare_api_token (sensitive), account_id, zone_id, zone_name
  locals.tf            dữ liệu zone: DNS records, redirect rule, zone settings
  main.tf              gọi module dns + redirects, resource cloudflare_zone_setting
  outputs.tf
  backend.tf           state ở R2 (backend s3), bucket tuvimienphi-tfstate
  imports.tf           khối import {} cho lần apply đầu trên CI
  terraform.tfvars.example
  modules/
    dns/               for_each trên map records -> cloudflare_dns_record
    redirects/         cloudflare_ruleset phase http_request_dynamic_redirect
```

Thêm một app có subdomain = thêm một mục vào `local.dns_records` (và cấu hình ingress tunnel ở đợt 2).

## Import

`locals.tf` đã khớp zone đang chạy. `imports.tf` khai địa chỉ và ID của 16 resource (7 bản ghi DNS, ruleset redirect, 8 zone setting). Lần `apply` đầu trên CI nhập chúng vào state ở R2 mà không đổi gì trên Cloudflare; sau đó xoá `imports.tf` bằng một PR riêng.

Sinh lại config từ zone đang chạy (khi thêm loại resource mới ở đợt 2):

```bash
export CLOUDFLARE_API_TOKEN="<token chỉ đọc của bạn>"
export CLOUDFLARE_ACCOUNT_ID="cd90142d588c7b6d177b93df1cf401ba"
export ZONE_ID="6fbe9dd5311b9d129f4416b02465182a"

bash tools/infra/cf-import.sh
```

Script ghi config và lệnh import vào `infra/cloudflare/generated/` (gitignored). Chép giá trị vào `locals.tf`, thêm khối `import {}` vào `imports.tf`. Với bản ghi DNS, chép đúng `comment` và `ttl`, nếu không `plan` sẽ lệch mãi.

`plan` trên PR phải ra `N to import, 0 to add, 0 to change, 0 to destroy`.

Chạy `plan` trên máy không cần khoá R2: tạo `backend_override.tf` (gitignored) với `terraform { backend "local" {} }`, rồi `terraform init` và `terraform plan` với `TF_VAR_cloudflare_api_token`, `TF_VAR_cloudflare_account_id`, `TF_VAR_zone_id`. State trên máy chỉ để thử, không chép lên R2.

## Những chỗ import đúng hiện trạng rồi sửa sau (mỗi mục một PR riêng)

Import để `plan` ra No changes **trước**, các thay đổi dưới đây là PR tiếp theo:

- `min_tls_version` đang là `1.0` → nâng lên `1.2`.
- DNSSEC đang tắt → bật (`cloudflare_zone_dnssec`) kèm DS record ở onamae.
- `r2.dev` của bucket backup `tuvimienphi` đã tắt → Terraform phải giữ tắt (đợt 2).
- Media đang dùng `r2.dev` → chuyển sang custom domain `media.xemtuvimienphi.top`, đổi `R2_MEDIA_PUBLIC_URL` (đợt 2).

## CI

Workflow `.github/workflows/terraform-cloudflare.yml`:

- PR đụng `infra/cloudflare/**`: `plan -lock=false` với token chỉ đọc và khoá R2 chỉ đọc từ `terraform-plan.enc.env`, environment `cloudflare-terraform-plan`, comment kết quả vào PR.
- Merge vào `dev`: `apply` với token ghi và khoá R2 ghi từ `terraform.enc.env`, environment `vps-sieu-toc-production`.

Hai file SOPS có `CLOUDFLARE_ACCOUNT_ID`, `ZONE_ID` (không mã hoá), `CLOUDFLARE_API_TOKEN`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`. `terraform-plan.enc.env` mở được bằng khoá age riêng của environment plan; khoá đó không mở được `terraform.enc.env`. Workflow chỉ đọc secret bootstrap `SOPS_AGE_KEY`.
