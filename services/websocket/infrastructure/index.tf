terraform {
  backend "s3" {}
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "stage" {
  description = "Deployment stage"
  type        = string
  default     = "dev"
}

# Include storage module
module "storage" {
  source = "./storage"
  region = var.region
  stage  = var.stage
}
