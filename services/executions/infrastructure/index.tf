terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
  backend "s3" {
    key = "domain/query/terraform.tfstate"
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
}

variable "stage" {
  description = "The deployment stage"
  type        = string
}

variable "region" {
  type        = string
  default     = "eu-central-1"
  description = "Region the database service infrastructure is created in."
}

module "storage" {
  source = "./storage"
  stage  = var.stage
}