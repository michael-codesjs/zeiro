variable "stage" {
  type        = string
  default     = "dev"
  description = "Stage the database storage infrastructure is created in."
}

variable "region" {
  type        = string
  default     = "eu-central-1"
  description = "Region the database storage infrastructure is created in."
}