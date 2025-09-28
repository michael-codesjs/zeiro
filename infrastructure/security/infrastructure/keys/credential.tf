# KMS Key for Credential Encryption

# Data source to get current AWS account ID and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# KMS Key for encrypting credentials
resource "aws_kms_key" "credentials_key" {
  
  description = "Zeiro Credentials Encryption Key - ${var.stage}"
  
  # Key usage and specifications
  key_usage                = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  
  # Security settings
  enable_key_rotation    = false
  
  # Key policy for fine-grained access control
  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "zeiro-credentials-key-policy"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "AllowZeiroServiceRolesByPattern"
        Effect = "Allow"
        Principal = {
          AWS = "*"
        }
        Action = [
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
        Condition = {
          StringLike = {
            "aws:PrincipalArn" = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/zeiro-${var.stage}-*-lambdaRole"
          },
          StringEquals = {
            "kms:EncryptionContext:service" = "zeiro-credentials"
          }
        }
      }
    ]
  })

  tags = {
    Name        = "zeiro-credentials-key-${var.stage}"
    Environment = var.stage
    Service     = "zeiro"
    Purpose     = "credential-encryption"
  }
}

# KMS Key Alias for easier reference
resource "aws_kms_alias" "credentials_key_alias" {
  name          = "alias/zeiro-credentials-${var.stage}"
  target_key_id = aws_kms_key.credentials_key.key_id
}

# SSM Parameters for storing KMS key information
resource "aws_ssm_parameter" "kms_key_id" {
  name        = "/zeiro/${var.stage}/infrastructure/security/kms/credentials-key/id"
  description = "KMS Key ID for Zeiro credentials encryption"
  type        = "String"
  value       = aws_kms_key.credentials_key.key_id

  tags = {
    Environment = var.stage
    Service     = "zeiro"
    Purpose     = "kms-key-id"
  }
}

resource "aws_ssm_parameter" "kms_key_arn" {
  name        = "/zeiro/${var.stage}/infrastructure/security/kms/credentials-key/arn"
  description = "KMS Key ARN for Zeiro credentials encryption"
  type        = "String"
  value       = aws_kms_key.credentials_key.arn

  tags = {
    Environment = var.stage
    Service     = "zeiro"
    Purpose     = "kms-key-arn"
  }
}

resource "aws_ssm_parameter" "kms_key_alias" {
  name        = "/zeiro/${var.stage}/infrastructure/security/kms/credentials-key/alias"
  description = "KMS Key Alias for Zeiro credentials encryption"
  type        = "String"
  value       = aws_kms_alias.credentials_key_alias.name

  tags = {
    Environment = var.stage
    Service     = "zeiro"
    Purpose     = "kms-key-alias"
  }
}

# Outputs for other modules to reference
output "kms_key_id" {
  description = "The ID of the KMS key for credentials encryption"
  value       = aws_kms_key.credentials_key.key_id
}

output "kms_key_arn" {
  description = "The ARN of the KMS key for credentials encryption"
  value       = aws_kms_key.credentials_key.arn
}

output "kms_key_alias" {
  description = "The alias of the KMS key for credentials encryption"
  value       = aws_kms_alias.credentials_key_alias.name
}

 
