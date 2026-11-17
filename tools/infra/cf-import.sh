#!/usr/bin/env bash
set -euo pipefail

: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN to your read-only Cloudflare token}"
: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID}"
: "${ZONE_ID:?Set ZONE_ID to the xemtuvimienphi.top zone id}"

if ! command -v cf-terraforming >/dev/null 2>&1; then
  echo "cf-terraforming is not installed." >&2
  echo "  brew install cloudflare/cloudflare/cf-terraforming" >&2
  echo "  or: go install github.com/cloudflare/cf-terraforming/cmd/cf-terraforming@latest" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "${script_dir}/../.." && pwd)"
out_dir="${root_dir}/infra/cloudflare/generated"
mkdir -p "$out_dir"

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

init_dir="${work_dir}/tf"
mkdir -p "$init_dir"
cat >"${init_dir}/versions.tf" <<'HCL'
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {}
HCL
terraform -chdir="$init_dir" init -input=false >/dev/null

terraform_bin="$(command -v terraform)"
resources=(cloudflare_dns_record cloudflare_ruleset cloudflare_zone_setting)

for resource in "${resources[@]}"; do
  echo "Generating ${resource} ..."
  env -u CLOUDFLARE_ACCOUNT_ID cf-terraforming generate \
    --terraform-binary-path "$terraform_bin" \
    --terraform-install-path "$init_dir" \
    --resource-type "$resource" \
    --zone "$ZONE_ID" \
    >"${work_dir}/${resource}.tf"
  env -u CLOUDFLARE_ACCOUNT_ID cf-terraforming import \
    --terraform-binary-path "$terraform_bin" \
    --terraform-install-path "$init_dir" \
    --resource-type "$resource" \
    --zone "$ZONE_ID" \
    >"${work_dir}/${resource}.import.sh"
  mv "${work_dir}/${resource}.tf" "${out_dir}/${resource}.tf"
  mv "${work_dir}/${resource}.import.sh" "${out_dir}/${resource}.import.sh"
done

echo
echo "Done. Generated config and import commands are in ${out_dir} (gitignored)."
echo
echo "Next steps:"
echo "  1. Copy the real values from generated/cloudflare_dns_record.tf into infra/cloudflare/locals.tf"
echo "     (replace every __FILL_FROM_CF_TERRAFORMING__)."
echo "  2. Run terraform import, rewriting each generated address to the module form, e.g.:"
echo "       terraform import 'module.dns.cloudflare_dns_record.this[\"apex\"]' ${ZONE_ID}/<record_id>"
echo "       terraform import 'module.redirects.cloudflare_ruleset.dynamic_redirect' ${ZONE_ID}/<ruleset_id>"
echo "       terraform import 'cloudflare_zone_setting.this[\"ssl\"]' ${ZONE_ID}/ssl"
echo "  3. terraform plan until it prints 'No changes'."
