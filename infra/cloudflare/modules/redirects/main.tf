resource "cloudflare_ruleset" "dynamic_redirect" {
  zone_id = var.zone_id
  name    = "default"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules = [
    for rule in var.rules : {
      ref         = rule.ref
      description = rule.description
      expression  = rule.expression
      action      = "redirect"
      enabled     = true

      action_parameters = {
        from_value = {
          status_code           = rule.status_code
          preserve_query_string = rule.preserve_query_string

          target_url = {
            expression = rule.target_expression
          }
        }
      }
    }
  ]
}
