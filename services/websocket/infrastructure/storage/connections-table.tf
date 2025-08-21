# DynamoDB table for storing WebSocket connections
resource "aws_dynamodb_table" "websocket_connections" {
  name           = "zeiro-${var.stage}-websocket-connections"
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
    name = "gsi1pk"
    type = "S"
  }

  attribute {
    name = "gsi1sk"
    type = "S"
  }

  global_secondary_index {
    name     = "gsi1"
    hash_key = "gsi1pk"
    range_key = "gsi1sk"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.stage == "prod" ? true : false
  }

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Service     = "websocket"
    Description = "WebSocket connections storage"
  }
}

# SSM parameters for the table
resource "aws_ssm_parameter" "websocket_connections_table_name" {
  name  = "/zeiro/${var.stage}/domain/websocket/infrastructure/storage/connections-table/name"
  type  = "SecureString"
  value = aws_dynamodb_table.websocket_connections.name

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Service     = "websocket"
  }
}

resource "aws_ssm_parameter" "websocket_connections_table_arn" {
  name  = "/zeiro/${var.stage}/domain/websocket/infrastructure/storage/connections-table/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.websocket_connections.arn

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Service     = "websocket"
  }
}
