resource "aws_cloudwatch_event_bus" "central_event_bus" {

  name = "zeiro-${var.stage}-central"

  tags = {
    Application = "zeiro"
    Enviroment  = var.stage
    Description = "zeiro central event bus."
  }

}

resource "aws_ssm_parameter" "central_event_bus_arn" {
  name  = "/zeiro/${var.stage}/infrastructure/io/event-bus/central/arn"
  type  = "SecureString"
  value = aws_cloudwatch_event_bus.central_event_bus.arn
}

resource "aws_ssm_parameter" "central_event_bus_name" {
  name  = "/zeiro/${var.stage}/infrastructure/io/event-bus/central/name"
  type  = "SecureString"
  value = aws_cloudwatch_event_bus.central_event_bus.name
}
