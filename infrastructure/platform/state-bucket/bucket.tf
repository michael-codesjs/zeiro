resource "aws_s3_bucket" "bucket" {
    bucket = "zeiro-state-bucket"

    lifecycle {
      prevent_destroy = true
    }
    tags = {
        Name = "zeiro-state-bucket"
        Application = "zeiro"
        Layer = "Platform"
    }
}

resource "aws_s3_bucket_versioning" "bucket_versioning" {
  bucket = aws_s3_bucket.bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "bucket_server_side_encryptio_configuration" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "AES256"
    }
  }
}

resource "aws_ssm_parameter" "bucket_name" {
  name  = "/zeiro/cicd/state-bucket/name"
  type  = "SecureString"
  value = aws_s3_bucket.bucket.bucket
}

resource "aws_ssm_parameter" "bucket_arn" {
  name  = "/zeiro/cicd/state-bucket/arn"
  type  = "SecureString"
  value = aws_s3_bucket.bucket.arn
}

output "prod_bucket_arn" {
    value = aws_s3_bucket.bucket.arn
}