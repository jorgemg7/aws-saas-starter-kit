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
