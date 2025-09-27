resource "aws_dynamodb_table" "table" {
    
    name = "zeiro-table-${var.stage}"
    

    billing_mode   = "PROVISIONED"
    read_capacity  = 1
    write_capacity = 1
    
    stream_enabled   = true
    stream_view_type = "NEW_AND_OLD_IMAGES"

    hash_key  = "PK"
    range_key = "SK"

    # TTL configuration for automatic expiration
    ttl {
      attribute_name = "ttl"
      enabled        = true
    }

    # Primary table attributes
    attribute {
      name = "PK"
      type = "S"
    }

    attribute {
      name = "SK"
      type = "S"
    }

    # GSI attributes
    attribute {
      name = "GSI1_PK"
      type = "S"
    }

    attribute {
      name = "GSI1_SK"
      type = "S"
    }

    attribute {
      name = "GSI2_PK"
      type = "S"
    }

    attribute {
      name = "GSI2_SK"
      type = "S"
    }

    attribute {
      name = "GSI3_PK"
      type = "S"
    }

    attribute {
      name = "GSI3_SK"
      type = "S"
    }

    attribute {
      name = "GSI4_PK"
      type = "S"
    }

    attribute {
      name = "GSI4_SK"
      type = "S"
    }

    attribute {
      name = "GSI5_PK"
      type = "S"
    }

    attribute {
      name = "GSI5_SK"
      type = "S"
    }

    # Global Secondary Index 1
    global_secondary_index {
      name            = "GSI1"
      hash_key        = "GSI1_PK"
      range_key       = "GSI1_SK"
      projection_type = "ALL"
      read_capacity   = 1
      write_capacity  = 1
    }

    # Global Secondary Index 2
    global_secondary_index {
      name            = "GSI2"
      hash_key        = "GSI2_PK"
      range_key       = "GSI2_SK"
      projection_type = "ALL"
      read_capacity   = 1
      write_capacity  = 1
    }

    # Global Secondary Index 3
    global_secondary_index {
      name            = "GSI3"
      hash_key        = "GSI3_PK"
      range_key       = "GSI3_SK"
      projection_type = "ALL"
      read_capacity   = 1
      write_capacity  = 1
    }

    # Global Secondary Index 4
    global_secondary_index {
      name            = "GSI4"
      hash_key        = "GSI4_PK"
      range_key       = "GSI4_SK"
      projection_type = "ALL"
      read_capacity   = 1
      write_capacity  = 1
    }

    # Global Secondary Index 5
    global_secondary_index {
      name            = "GSI5"
      hash_key        = "GSI5_PK"
      range_key       = "GSI5_SK"
      projection_type = "ALL"
      read_capacity   = 1
      write_capacity  = 1
    }
    
    lifecycle {
      prevent_destroy = true
    }
    tags = {
      Name        = "zeiro-table-${var.stage}"
      Description = "zeiro table."
      Application = "zeiro"
      Stage       = var.stage
    }

}

resource "aws_ssm_parameter" "table_name" {
  name      = "/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/name"
  type      = "SecureString"
  value     = aws_dynamodb_table.table.name
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "table_arn" {
  name      = "/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/arn"
  type      = "SecureString"
  value     = aws_dynamodb_table.table.arn
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "table_stream_arn" {
  name      = "/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/stream-arn"
  type      = "SecureString"
  value     = aws_dynamodb_table.table.stream_arn
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}