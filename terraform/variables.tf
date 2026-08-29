variable "project_name" {
  description = "Project name used as prefix for AWS resources"
  type        = string
  default     = "aws-saas-starter-kit"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "eu-west-1"
}
variable "frontend_bucket_name" {
  description = "Optional custom S3 bucket name"
  type        = string
  default     = ""
}

variable "enable_versioning" {
  description = "Enable S3 bucket versioning"
  type        = bool
  default     = true
}

variable "installation_id" {
  description = "Optional persistent unique identifier for this installation"
  type        = string
  default     = ""

  validation {
    condition     = var.installation_id == "" || can(regex("^[a-z0-9-]{4,32}$", var.installation_id))
    error_message = "installation_id must contain only lowercase letters, numbers, and hyphens, between 4 and 32 characters."
  }
}

variable "legacy_naming" {
  description = "Preserve the original resource naming scheme for an existing installation"
  type        = bool
  default     = false
}
