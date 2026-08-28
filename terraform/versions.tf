terraform {
  required_version = ">= 1.13.0"

  backend "s3" {
    key          = "terraform.tfstate"
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

    random = {
      source  = "hashicorp/random"
      version = "~> 3.7"
    }
  }
}
