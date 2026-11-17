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
    --modern-import-block \
    >"${work_dir}/${resource}.imports.tf"
  mv "${work_dir}/${resource}.tf" "${out_dir}/${resource}.tf"
  mv "${work_dir}/${resource}.imports.tf" "${out_dir}/${resource}.imports.tf"
done

echo
echo "Done. Generated config and import blocks are in ${out_dir} (gitignored)."
echo
echo "Next steps:"
echo "  1. Copy the values you need from generated/*.tf into infra/cloudflare/locals.tf."
echo "     Skip the apex and dashboard records: the Worker custom domains own them."
echo "  2. Copy the matching import {} blocks from generated/*.imports.tf into infra/cloudflare/imports.tf,"
echo "     rewriting each address to the module form, e.g. module.dns.cloudflare_dns_record.this[\"api\"]."
echo "  3. Open a PR: the plan must show 'N to import, 0 to add, 0 to change, 0 to destroy'."
