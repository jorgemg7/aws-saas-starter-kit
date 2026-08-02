provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "aws-saas-starter-kit"
      ManagedBy = "Terraform"
    }
  }
}
