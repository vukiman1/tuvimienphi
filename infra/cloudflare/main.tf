module "dns" {
  source  = "./modules/dns"
  zone_id = var.zone_id
  records = local.dns_records
}

module "redirects" {
  source  = "./modules/redirects"
  zone_id = var.zone_id
  rules   = local.redirect_rules
}

resource "cloudflare_zone_setting" "this" {
  for_each = local.zone_settings

  zone_id    = var.zone_id
  setting_id = each.key
  value      = each.value
}
