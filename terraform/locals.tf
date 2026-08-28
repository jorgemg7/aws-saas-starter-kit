resource "random_id" "installation" {
  byte_length = 4
}

locals {
  installation_id = random_id.installation.hex

  resource_prefix = "${var.project_name}-${var.environment}-${local.installation_id}"

  bucket_name = var.frontend_bucket_name != "" ? var.frontend_bucket_name : local.resource_prefix

  common_tags = {
    Project        = var.project_name
    Environment    = var.environment
    InstallationId = local.installation_id
    ManagedBy      = "Terraform"
  }
}
