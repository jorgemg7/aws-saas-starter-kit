resource "random_id" "installation" {
  count       = var.legacy_naming || var.installation_id != "" ? 0 : 1
  byte_length = 4
}

locals {
  installation_id = var.legacy_naming ? "" : (
    var.installation_id != "" ? var.installation_id : random_id.installation[0].hex
  )

  resource_prefix = var.legacy_naming ? (
    "${var.project_name}-${var.environment}"
    ) : (
    "${var.project_name}-${var.environment}-${local.installation_id}"
  )

  bucket_name = var.frontend_bucket_name != "" ? var.frontend_bucket_name : local.resource_prefix

  common_tags = {
    Project        = var.project_name
    Environment    = var.environment
    InstallationId = local.installation_id
    ManagedBy      = "Terraform"
  }
}
