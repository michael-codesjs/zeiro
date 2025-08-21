resource "aws_dynamodb_table" "zeiro_data_sources_table" {
  name           = "zeiro-data-sources-table-${var.stage}"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "pk"
  range_key      = "sk"

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

  attribute {
    name = "gs3pk"
    type = "S"
  }

  attribute {
    name = "gs3sk"
    type = "S"
  }

  # Global Secondary Index 1: Query data sources by type
  global_secondary_index {
    name            = "gs1"
    hash_key        = "gs1pk"
    range_key       = "gs1sk"
    projection_type = "ALL"
  }

  # Global Secondary Index 2: Query data sources by user and type
  global_secondary_index {
    name            = "gs2"
    hash_key        = "gs2pk"
    range_key       = "gs2sk"
    projection_type = "ALL"
  }

  # Global Secondary Index 3: Query data sources by user and environment
  global_secondary_index {
    name            = "gs3"
    hash_key        = "gs3pk"
    range_key       = "gs3sk"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "zeiro-data-sources-table-${var.stage}"
    Environment = var.stage
    Domain      = "data-sources"
    Project     = "zeiro"
  }

  lifecycle {
    prevent_destroy = false
  }
}

# SSM Parameters for the data sources table
resource "aws_ssm_parameter" "data_sources_table_name" {
  name  = "/zeiro/${var.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/name"
  type  = "String"
  value = aws_dynamodb_table.zeiro_data_sources_table.name

  tags = {
    Environment = var.stage
    Domain      = "data-sources"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "data_sources_table_arn" {
  name  = "/zeiro/${var.stage}/domain/data-sources/infrastructure/storage/zeiro-data-sources-table/arn"
  type  = "String"
  value = aws_dynamodb_table.zeiro_data_sources_table.arn

  tags = {
    Environment = var.stage
    Domain      = "data-sources"
    Project     = "zeiro"
  }
}

# Outputs
output "data_sources_table_name" {
  value       = aws_dynamodb_table.zeiro_data_sources_table.name
  description = "Name of the DynamoDB table for data sources"
}

output "data_sources_table_arn" {
  value       = aws_dynamodb_table.zeiro_data_sources_table.arn
  description = "ARN of the DynamoDB table for data sources"
} 