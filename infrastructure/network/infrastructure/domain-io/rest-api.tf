resource "aws_api_gateway_rest_api" "central_api" {

  name        = "zeiro-${var.stage}-central"
  description = "Central REST API."

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "zeiro central REST API."
  }

}

resource "aws_api_gateway_resource" "central_api_index_resource" {
  rest_api_id = aws_api_gateway_rest_api.central_api.id
  parent_id   = aws_api_gateway_rest_api.central_api.root_resource_id
  path_part   = "mock"
}

resource "aws_api_gateway_method" "central_api_index_resource_method" {
  rest_api_id   = aws_api_gateway_rest_api.central_api.id
  resource_id   = aws_api_gateway_resource.central_api_index_resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "central_api_index_gateway_integration" {
  rest_api_id = aws_api_gateway_rest_api.central_api.id
  resource_id = aws_api_gateway_resource.central_api_index_resource.id
  http_method = aws_api_gateway_method.central_api_index_resource_method.http_method
  type        = "MOCK"
}

resource "aws_api_gateway_deployment" "central_api_deployment" {

  depends_on = [
    aws_api_gateway_method.central_api_index_resource_method,
  ]

  rest_api_id = aws_api_gateway_rest_api.central_api.id
  description = "Deployed at ${timestamp()}" # just some comment field which can be seen in deployment history

  lifecycle {
    create_before_destroy = true
  }

}

resource "aws_api_gateway_stage" "central_api_stage" {
  deployment_id = aws_api_gateway_deployment.central_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.central_api.id
  stage_name    = var.stage
  description   = timestamp() # forces to create a new deployment on each run

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_api_id" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/id"
  type      = "SecureString"
  value     = aws_api_gateway_rest_api.central_api.id
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_api_root_resource_id" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/root-resource-id"
  type      = "SecureString"
  value     = aws_api_gateway_rest_api.central_api.root_resource_id
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_api_arn" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/arn"
  type      = "SecureString"
  value     = aws_api_gateway_rest_api.central_api.arn
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_api_execution_arn" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/api_execution_arn"
  type      = "SecureString"
  value     = aws_api_gateway_rest_api.central_api.execution_arn
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_api_url" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/url"
  type      = "SecureString"
  value     = aws_api_gateway_stage.central_api_stage.invoke_url
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}