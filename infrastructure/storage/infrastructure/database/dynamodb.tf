resource "aws_dynamodb_table" "event_store_table" {
    
    name = "zeiro-table-${var.stage}"
    

    billing_mode   = "PROVISIONED"
    read_capacity  = "20"
    write_capacity = "20"
    
    # stream_enabled   = true
    # stream_view_type = "NEW_AND_OLD_IMAGES" // not need yet

    hash_key = "id"

    attribute {
      name = "id"
      type = "S"
    }
    
    tags = {
      Name        = "zeiro-table-${var.stage}"
      Description = "zeiro table."
      Application = "zeiro"
      Stage       = var.stage
    }

}

resource "aws_ssm_parameter" "event_store_table_name" {
  name  = "/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/name"
  type  = "SecureString"
  value = aws_dynamodb_table.event_store_table.name
}

resource "aws_ssm_parameter" "event_store_table_arn" {
  name  = "/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/arn"
  type  = "SecureString"
  value = aws_dynamodb_table.event_store_table.arn
}

# resource "aws_ssm_parameter" "event_store_table_stream_arn" {
#   name  ="/zeiro/${var.stage}/infrastructure/storage/database/zeiro-table/stream/arn"
#   type  = "SecureString"
#   value = aws_dynamodb_table.event_store_table.stream_arn
# }