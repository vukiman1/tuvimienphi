import {
  to = module.dns.cloudflare_dns_record.this["www"]
  id = "${var.zone_id}/a52f69baaadb1e5f72eb63821990ecd8"
}

import {
  to = module.dns.cloudflare_dns_record.this["api"]
  id = "${var.zone_id}/773ede52d099263106b9d022dd7b6be8"
}

import {
  to = module.dns.cloudflare_dns_record.this["logs"]
  id = "${var.zone_id}/24bf1bd82fc809ec174b06386783d582"
}

import {
  to = module.dns.cloudflare_dns_record.this["resend_send"]
  id = "${var.zone_id}/f6952e605fb9186903a6bd2ba9731b91"
}

import {
  to = module.dns.cloudflare_dns_record.this["resend_return"]
  id = "${var.zone_id}/dffb73640f66d29c00e1ae2e844462f3"
}

import {
  to = module.dns.cloudflare_dns_record.this["resend_dkim"]
  id = "${var.zone_id}/76666808c19d923caab9d3fa7e4e07a8"
}

import {
  to = module.dns.cloudflare_dns_record.this["google_site_verification"]
  id = "${var.zone_id}/6a0c4e9e23125b188d93fb670072e035"
}

import {
  to = module.redirects.cloudflare_ruleset.dynamic_redirect
  id = "zones/${var.zone_id}/2850610b1433498191641f0222bc98a0"
}

import {
  to = cloudflare_zone_setting.this["ssl"]
  id = "${var.zone_id}/ssl"
}

import {
  to = cloudflare_zone_setting.this["always_use_https"]
  id = "${var.zone_id}/always_use_https"
}

import {
  to = cloudflare_zone_setting.this["automatic_https_rewrites"]
  id = "${var.zone_id}/automatic_https_rewrites"
}

import {
  to = cloudflare_zone_setting.this["brotli"]
  id = "${var.zone_id}/brotli"
}

import {
  to = cloudflare_zone_setting.this["http3"]
  id = "${var.zone_id}/http3"
}

import {
  to = cloudflare_zone_setting.this["0rtt"]
  id = "${var.zone_id}/0rtt"
}

import {
  to = cloudflare_zone_setting.this["early_hints"]
  id = "${var.zone_id}/early_hints"
}

import {
  to = cloudflare_zone_setting.this["min_tls_version"]
  id = "${var.zone_id}/min_tls_version"
}
