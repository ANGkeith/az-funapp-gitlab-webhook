variable "prefix" {}
variable "location" {}
variable "AZURE_DEVOPS_USERNAME" {}
variable "GITLAB_WEBHOOK_SHARED_SECRET" {}

variable "AZURE_DEVOPS_PASSWORD" {
  description = "Scopes: Build(Read & Execute)"
}

variable "AZURE_DEVOPS_ORGANIZATION" {
  description = "Check the url of the pipeline: dev.azure.com/{organization}/{project}"
}

variable "AZURE_DEVOPS_PROJECT" {
  description = "Check the url of the pipeline: dev.azure.com/{organization}/{project}"
}

variable "GITLAB_PAT" {
  description = "Scopes: api"
}

variable "default_tags" {
  type = map
  default = {
    "terraform" = "true"
  }
}

locals {
  prefix = "${var.prefix}-git-webhook"
}