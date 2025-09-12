# Central WebSocket API Gateway
resource "aws_apigatewayv2_api" "central_websocket_api" {
  name          = "zeiro-${var.stage}-central-websocket"
  protocol_type = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
  description   = "Central WebSocket API for real-time communication"

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "zeiro central WebSocket API"
  }
}

# WebSocket API Stage
resource "aws_apigatewayv2_stage" "central_websocket_stage" {
  api_id      = aws_apigatewayv2_api.central_websocket_api.id
  name        = var.stage
  auto_deploy = true

  default_route_settings {
    detailed_metrics_enabled = true
    throttling_rate_limit    = 100
    throttling_burst_limit   = 200
  }

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "zeiro central WebSocket API stage"
  }
}

# SSM Parameters for Central WebSocket API
resource "aws_ssm_parameter" "central_websocket_api_id" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/id"
  type      = "SecureString"
  value     = aws_apigatewayv2_api.central_websocket_api.id
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_websocket_api_endpoint" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/endpoint"
  type      = "SecureString"
  value     = aws_apigatewayv2_api.central_websocket_api.api_endpoint
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_websocket_api_execution_arn" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/execution-arn"
  type      = "SecureString"
  value     = aws_apigatewayv2_api.central_websocket_api.execution_arn
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "central_websocket_stage_url" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/stage-url"
  type      = "SecureString"
  value     = "wss://${aws_apigatewayv2_api.central_websocket_api.id}.execute-api.${var.region}.amazonaws.com/${var.stage}"
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
} 