resource "aws_dynamodb_table" "mastra_storage_table" {
  name           = "zeiro-mastra-storage-${var.stage}"

  billing_mode   = "PROVISIONED"
  read_capacity  = 1
  write_capacity = 1
  
  hash_key       = "pk"
  range_key      = "sk"

  # Primary table attributes
  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  # Global Secondary Index 1 attributes
  attribute {
    name = "gsi1pk"
    type = "S"
  }

  attribute {
    name = "gsi1sk"
    type = "S"
  }

  # Global Secondary Index 2 attributes
  attribute {
    name = "gsi2pk"
    type = "S"
  }

  attribute {
    name = "gsi2sk"
    type = "S"
  }

  # Global Secondary Index 1: For thread and message queries
  global_secondary_index {
    name            = "gsi1"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }

  # Global Secondary Index 2: For resource-based queries
  global_secondary_index {
    name            = "gsi2"
    hash_key        = "gsi2pk"
    range_key       = "gsi2sk"
    projection_type = "ALL"
    read_capacity   = 1
    write_capacity  = 1
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "mastra-chat-table-${var.stage}"
    Environment = var.stage
    Domain      = "chat"
    Project     = "zeiro"
    Purpose     = "mastra-storage"
  }
}

# SSM Parameters for the Chat Service Mastra storage table
resource "aws_ssm_parameter" "mastra_storage_table_name" {
  name  = "/zeiro/${var.stage}/infrastructure/storage/mastra-single-table/name"
  type  = "String"
  value = aws_dynamodb_table.mastra_storage_table.name

  tags = {
    Environment = var.stage
    Domain      = "chat"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "mastra_storage_table_arn" {
  name  = "/zeiro/${var.stage}/infrastructure/storage/mastra-single-table/arn"
  type  = "String"
  value = aws_dynamodb_table.mastra_storage_table.arn

  tags = {
    Environment = var.stage
    Domain      = "chat"
    Project     = "zeiro"
  }
}

# Output the table name for use in other resources
output "mastra_storage_table_name" {
  description = "Name of the Mastra storage table"
  value       = aws_dynamodb_table.mastra_storage_table.name
}

output "mastra_storage_table_arn" {
  description = "ARN of the Mastra storage table"
  value       = aws_dynamodb_table.mastra_storage_table.arn
}