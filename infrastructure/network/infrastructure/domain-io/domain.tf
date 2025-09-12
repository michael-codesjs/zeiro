# Route53 Hosted Zone for usezeiro.com
data "aws_route53_zone" "usezeiro_zone" {
  name         = "usezeiro.com"
  private_zone = false
}

# Local values for domain configuration
locals {
  # For prod: api.usezeiro.com, for other stages: <stage>.usezeiro.com
  api_domain_name = var.stage == "prod" ? "api.usezeiro.com" : "${var.stage}.api.usezeiro.com"
  ws_domain_name  = var.stage == "prod" ? "ws.usezeiro.com" : "${var.stage}.ws.usezeiro.com"
}

# ACM Certificate for API domains
resource "aws_acm_certificate" "api_cert" {
  domain_name               = local.api_domain_name
  subject_alternative_names = [local.ws_domain_name]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "SSL certificate for Zeiro API domains"
  }
}

# Certificate validation records
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.usezeiro_zone.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "api_cert_validation" {
  certificate_arn         = aws_acm_certificate.api_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.api_cert_validation : record.fqdn]

  timeouts {
    create = "5m"
  }
}

# Custom domain name for REST API
resource "aws_api_gateway_domain_name" "api_domain" {
  domain_name              = local.api_domain_name
  regional_certificate_arn = aws_acm_certificate_validation.api_cert_validation.certificate_arn

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  depends_on = [aws_acm_certificate_validation.api_cert_validation]

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "Custom domain for Zeiro REST API"
  }
}

# Base path mapping for REST API
resource "aws_api_gateway_base_path_mapping" "api_mapping" {
  api_id      = aws_api_gateway_rest_api.central_api.id
  stage_name  = aws_api_gateway_deployment.central_api_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.api_domain.domain_name
}

# Route53 A record for REST API
resource "aws_route53_record" "api_record" {
  zone_id = data.aws_route53_zone.usezeiro_zone.zone_id
  name    = local.api_domain_name
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api_domain.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api_domain.regional_zone_id
    evaluate_target_health = true
  }
}

# Custom domain name for WebSocket API
resource "aws_apigatewayv2_domain_name" "websocket_domain" {
  domain_name = local.ws_domain_name

  domain_name_configuration {
    certificate_arn = aws_acm_certificate_validation.api_cert_validation.certificate_arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }

  depends_on = [aws_acm_certificate_validation.api_cert_validation]

  tags = {
    Application = "zeiro"
    Environment = var.stage
    Description = "Custom domain for Zeiro WebSocket API"
  }
}

# API mapping for WebSocket API
resource "aws_apigatewayv2_api_mapping" "websocket_mapping" {
  api_id      = aws_apigatewayv2_api.central_websocket_api.id
  domain_name = aws_apigatewayv2_domain_name.websocket_domain.id
  stage       = aws_apigatewayv2_stage.central_websocket_stage.name
}

# Route53 A record for WebSocket API
resource "aws_route53_record" "websocket_record" {
  zone_id = data.aws_route53_zone.usezeiro_zone.zone_id
  name    = local.ws_domain_name
  type    = "A"

  alias {
    name                   = aws_apigatewayv2_domain_name.websocket_domain.domain_name_configuration[0].target_domain_name
    zone_id                = aws_apigatewayv2_domain_name.websocket_domain.domain_name_configuration[0].hosted_zone_id
    evaluate_target_health = true
  }
}

# SSM Parameters for custom domains
resource "aws_ssm_parameter" "api_custom_domain_name" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/custom-domain-name"
  type      = "SecureString"
  value     = local.api_domain_name
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "api_custom_domain_url" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/api/custom-domain-url"
  type      = "SecureString"
  value     = "https://${local.api_domain_name}"
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "websocket_custom_domain_name" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/custom-domain-name"
  type      = "SecureString"
  value     = local.ws_domain_name
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}

resource "aws_ssm_parameter" "websocket_custom_domain_url" {
  name      = "/zeiro/${var.stage}/infrastructure/io/central/websocket/api/custom-domain-url"
  type      = "SecureString"
  value     = "wss://${local.ws_domain_name}"
  overwrite = true

  tags = {
    Application = "zeiro"
    Environment = var.stage
  }
}
