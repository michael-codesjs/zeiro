resource "aws_dynamodb_table" "credentials_table" {
  name = "zeiro-credentials-table-${var.stage}"

  billing_mode   = "PAY_PER_REQUEST"
  
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "gs1pk"
    type = "S"
  }

  attribute {
    name = "gs1sk"
    type = "S"
  }

  attribute {
    name = "gs2pk"
    type = "S"
  }

  attribute {
    name = "gs2sk"
    type = "S"
  }

  global_secondary_index {
    name     = "gs1"
    hash_key = "gs1pk"
    range_key = "gs1sk"
    projection_type = "ALL"
  }

  global_secondary_index {
    name     = "gs2"
    hash_key = "gs2pk"
    range_key = "gs2sk"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "zeiro-credentials-table-${var.stage}"
    Description = "zeiro credentials table for storing encrypted database credentials"
    Application = "zeiro"
    Service     = "credentials"
    Domain      = "credentials"
    Stage       = var.stage
  }
}

resource "aws_ssm_parameter" "credentials_table_name" {
  name  = "/zeiro/${var.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/name"
  type  = "SecureString"
  value = aws_dynamodb_table.credentials_table.name
}

resource "aws_ssm_parameter" "credentials_table_arn" {
  name  = "/zeiro/${var.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.credentials_table.arn
}

resource "aws_ssm_parameter" "credentials_table_stream_arn" {
  name  = "/zeiro/${var.stage}/domain/credentials/infrastructure/storage/zeiro-credentials-table/stream/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.credentials_table.stream_arn
}

resource "aws_ssm_parameter" "credentials_encryption_key" {
  name  = "/zeiro/${var.stage}/domain/credentials/infrastructure/encryption/key"
  type  = "SecureString"
  value = "CHANGE_ME"
  
  tags = {
    Name        = "credentials-encryption-key-${var.stage}"
    Description = "Encryption key for credentials service"
    Application = "zeiro"
    Service     = "credentials"
    Stage       = var.stage
  }
}