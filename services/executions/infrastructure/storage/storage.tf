resource "aws_dynamodb_table" "executions_table" {
  name           = "zeiro-executions-table-${var.stage}"
  billing_mode   = "PAY_PER_REQUEST"
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
  }

  # Global Secondary Index 2: For resource-based queries
  global_secondary_index {
    name            = "gsi2"
    hash_key        = "gsi2pk"
    range_key       = "gsi2sk"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "mastra-executions-table-${var.stage}"
    Environment = var.stage
    Domain      = "executions"
    Project     = "zeiro"
    Purpose     = "mastra-storage"
  }
}

# Query Executions Table - Track async query execution
resource "aws_dynamodb_table" "query_executions_table" {
  name           = "zeiro-query-executions-${var.stage}"
  billing_mode   = "PAY_PER_REQUEST"
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

  # GSI for querying by status
  attribute {
    name = "gsi1pk"
    type = "S"
  }

  attribute {
    name = "gsi1sk"
    type = "S"
  }

  # GSI for querying by execution ID
  attribute {
    name = "gsi2pk"
    type = "S"
  }

  attribute {
    name = "gsi2sk"
    type = "S"
  }

  # Global Secondary Index 1: Query by user and status
  global_secondary_index {
    name            = "gsi1"
    hash_key        = "gsi1pk"
    range_key       = "gsi1sk"
    projection_type = "ALL"
  }

  # Global Secondary Index 2: Query by execution ID
  global_secondary_index {
    name            = "gsi2"
    hash_key        = "gsi2pk"
    range_key       = "gsi2sk"
    projection_type = "ALL"
  }

  # TTL for automatic cleanup of old executions
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }

  server_side_encryption {
    enabled = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name        = "zeiro-query-executions-${var.stage}"
    Environment = var.stage
    Domain      = "executions"
    Project     = "zeiro"
    Purpose     = "async-query-tracking"
  }
}



# SQS Queue for async query execution
resource "aws_sqs_queue" "query_execution_queue" {
  name                       = "zeiro-executions-queue-${var.stage}"
  delay_seconds              = 0
  max_message_size           = 262144
  message_retention_seconds  = 1209600  # 14 days
  receive_wait_time_seconds  = 0
  visibility_timeout_seconds = 300      # 5 minutes

  # Dead letter queue configuration
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.query_execution_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = "zeiro-executions-queue-${var.stage}"
    Environment = var.stage
    Domain      = "executions"
    Project     = "zeiro"
    Purpose     = "async-query-processing"
  }
}

# Dead letter queue for failed query executions
resource "aws_sqs_queue" "query_execution_dlq" {
  name                       = "zeiro-executions-dlq-${var.stage}"
  message_retention_seconds  = 1209600  # 14 days

  tags = {
    Name        = "zeiro-query-execution-dlq-${var.stage}"
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
    Purpose     = "failed-query-processing"
  }
}

# SSM Parameters for the Executions Service resources

# Mastra storage table parameters
resource "aws_ssm_parameter" "mastra_storage_table_name" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/mastra-single-table/name"
  type  = "String"
  value = aws_dynamodb_table.executions_table.name

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "mastra_storage_table_arn" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/mastra-single-table/arn"
  type  = "String"
  value = aws_dynamodb_table.executions_table.arn

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}

# Query Executions table parameters
resource "aws_ssm_parameter" "query_executions_table_name" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/query-executions-table/name"
  type  = "String"
  value = aws_dynamodb_table.query_executions_table.name

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "query_executions_table_arn" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/query-executions-table/arn"
  type  = "String"
  value = aws_dynamodb_table.query_executions_table.arn

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}



# SQS Queue parameters
resource "aws_ssm_parameter" "query_execution_queue_url" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/query-execution-queue/url"
  type  = "String"
  value = aws_sqs_queue.query_execution_queue.url

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "query_execution_queue_arn" {
  name  = "/zeiro/${var.stage}/domain/query/infrastructure/storage/query-execution-queue/arn"
  type  = "String"
  value = aws_sqs_queue.query_execution_queue.arn

  tags = {
    Environment = var.stage
    Domain      = "query"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "query_execution_dlq_url" {
  name  = "/zeiro/${var.stage}/domain/executions/infrastructure/storage/query-execution-dlq/url"
  type  = "String"
  value = aws_sqs_queue.query_execution_dlq.url

  tags = {
    Environment = var.stage
    Domain      = "executions"
    Project     = "zeiro"
  }
}

resource "aws_ssm_parameter" "query_execution_dlq_arn" {
  name  = "/zeiro/${var.stage}/domain/executions/infrastructure/storage/query-execution-dlq/arn"
  type  = "String"
  value = aws_sqs_queue.query_execution_dlq.arn

  tags = {
    Environment = var.stage
    Domain      = "executions"
    Project     = "zeiro"
  }
}