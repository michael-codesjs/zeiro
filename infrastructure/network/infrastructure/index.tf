terraform {
  backend "s3" {}
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.1.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

variable "stage" {
  description = "The stage of the deployment (dev/prod)"
  type        = string
  default     = "dev"
}

module "domain-io" {
  source = "./domain-io"
  stage  = var.stage
}
