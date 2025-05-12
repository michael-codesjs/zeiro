terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "s3" {
    key = "domain/user/users/terraform.tfstate"
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
}

variable "stage" {
  type        = string
  default     = "dev"
  description = "Stage the user service infrastructure is created in."
}

variable "region" {
  type        = string
  default     = "eu-central-1"
  description = "Region the user service infrastructure is created in."
}

module "cognito" {
  source = "./cognito"
  stage  = var.stage
  region = var.region
}