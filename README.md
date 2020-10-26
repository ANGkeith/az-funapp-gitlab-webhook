# Gitlab Webhook
This provisions an azure function app to queue Azure DevOps pipeline using [REST APIs](https://docs.microsoft.com/en-us/rest/api/azure/devops/build/builds/queue?view=azure-devops-rest-6.0)
using Gitlab webhooks.

Only the merge requests events trigger is tested.

## Dependency
- yarn
- zip
- az cli
- terraform

## Usage

Add the following snippets into your terraform files, as well as declaring the
variables as needed.

``` hcl
module "gitlab-webhook" {
  count = var.ENVIRONMENT == "dev" ? 1 : 0

  source = "github.com/ANGkeith/az-funapp-gitlab-webhook?ref=master"

  prefix                       = var.prefix
  location                     = var.location
  AZURE_DEVOPS_USERNAME        = var.AZURE_DEVOPS_USERNAME
  AZURE_DEVOPS_PASSWORD        = var.AZURE_DEVOPS_PASSWORD
  AZURE_DEVOPS_ORGANIZATION    = "<organization>"
  AZURE_DEVOPS_PROJECT         = "<project>"
  GITLAB_WEBHOOK_SHARED_SECRET = var.GITLAB_WEBHOOK_SHARED_SECRET
  GITLAB_PAT                   = var.GITLAB_PAT
}

output "webhook_url" {
  value = module.gitlab-webhook[0].webhook_url
}
```
