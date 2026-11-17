locals {
  tunnel_cname = "c61b019b-fb8c-41d2-9776-c785811cd637.cfargotunnel.com"

  dns_records = {
    www = {
      name    = "www.${var.zone_name}"
      type    = "AAAA"
      content = "100::"
      proxied = true
      comment = "www redirects to the apex via a redirect rule"
    }
    api = {
      name    = "api.${var.zone_name}"
      type    = "CNAME"
      content = local.tunnel_cname
      proxied = true
    }
    logs = {
      name    = "logs.${var.zone_name}"
      type    = "CNAME"
      content = local.tunnel_cname
      proxied = true
    }
    resend_send = {
      name    = "send.${var.zone_name}"
      type    = "CNAME"
      content = "send.forge.rmta.net"
      ttl     = 3600
    }
    resend_return = {
      name    = "rsend.${var.zone_name}"
      type    = "CNAME"
      content = "rsend-apne1.forge.rmta.net"
      ttl     = 3600
    }
    resend_dkim = {
      name    = "resend._domainkey.${var.zone_name}"
      type    = "TXT"
      content = "\"p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDLwjiPTsULDOFomcK3XGUfuWN/tEl34Dg9+2qIU6AMnu9SqC5YNOhWS+pfRgZkvgdJiX8p8bv05E7K0weqax9BThEOvkoB9NZv1coSea7rXRO62IdUpG5vFifqrwaM3EKUHH7u2NtYrZNjD/MYSIChWNoVFd31SOgqi8YuSUU3JQIDAQAB\""
      ttl     = 3600
    }
    google_site_verification = {
      name    = var.zone_name
      type    = "TXT"
      content = "\"google-site-verification=HRN4wAu-Gav9SXmQiRid1t4uqPJnXuU5_Gn6FfQLz7g\""
      ttl     = 3600
    }
  }

  redirect_rules = [
    {
      ref               = "0335b47efccb4c739ca6f8b3d11a4bce"
      description       = "www to apex"
      expression        = "(http.host eq \"www.${var.zone_name}\")"
      target_expression = "concat(\"https://${var.zone_name}\", http.request.uri.path)"
      status_code       = 301
    }
  ]

  zone_settings = {
    ssl                      = "full"
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    brotli                   = "on"
    http3                    = "on"
    "0rtt"                   = "on"
    early_hints              = "on"
    min_tls_version          = "1.0"
  }
}
