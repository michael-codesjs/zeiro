resource "aws_dynamodb_table" "event_store_table" {
    
    name = "zeiro-users-table-${var.stage}"
    

    billing_mode   = "PROVISIONED"
    read_capacity  = "1"
    write_capacity = "1"
    
    stream_enabled   = true
    stream_view_type = "NEW_AND_OLD_IMAGES"

    hash_key = "id"

    attribute {
      name = "id"
      type = "S"
    }
    
    tags = {
      Name        = "zeiro-users-table-${var.stage}"
      Description = "zeiro users table."
      Application = "zeiro"
      Service     = "user"
      Domain      = "user"
      Stage       = var.stage
    }

}

resource "aws_ssm_parameter" "event_store_table_name" {
  name  = "/zeiro/${var.stage}/domain/user/users/infrastructure/storage/zeiro-users-table/name"
  type  = "SecureString"
  value = aws_dynamodb_table.event_store_table.name
}

resource "aws_ssm_parameter" "event_store_table_arn" {
  name  = "/zeiro/${var.stage}/domain/user/users/infrastructure/storage/zeiro-users-table/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.event_store_table.arn
}

resource "aws_ssm_parameter" "event_store_table_stream_arn" {
  name  ="/zeiro/${var.stage}/domain/user/users/infrastructure/storage/zeiro-users-table/stream/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.event_store_table.stream_arn
}