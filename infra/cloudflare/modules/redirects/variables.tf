variable "zone_id" {
  type = string
}

variable "rules" {
  type = list(object({
    ref                   = string
    description           = string
    expression            = string
    target_expression     = string
    status_code           = optional(number, 301)
    preserve_query_string = optional(bool, true)
  }))
}
