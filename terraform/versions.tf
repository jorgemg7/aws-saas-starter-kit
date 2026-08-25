terraform {
  required_version = ">= 1.13.0"

  backend "s3" {
    bucket       = "aws-saas-starter-kit-dev-terraform-state-567251176387"
    key          = "terraform.tfstate"
    region       = "eu-west-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.7"
    }
  }
}
