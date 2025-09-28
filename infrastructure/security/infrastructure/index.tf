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

module "kms_keys" {
  source = "./keys"
  stage  = var.stage
}

# Outputs for other infrastructure modules
output "credentials_kms_key_id" {
  description = "The ID of the KMS key for credentials encryption"
  value       = module.kms_keys.kms_key_id
}

output "credentials_kms_key_arn" {
  description = "The ARN of the KMS key for credentials encryption"
  value       = module.kms_keys.kms_key_arn
}

output "credentials_kms_key_alias" {
  description = "The alias of the KMS key for credentials encryption"
  value       = module.kms_keys.kms_key_alias
}
