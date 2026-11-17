variable "cloudflare_api_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type = string
}

variable "zone_id" {
  type = string
}

variable "zone_name" {
  type    = string
  default = "xemtuvimienphi.top"
}
