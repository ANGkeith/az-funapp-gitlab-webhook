data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

resource "azurerm_storage_account" "main" {
  name                     = replace("${local.prefix}-st", "-", "")
  depends_on               = [data.azurerm_resource_group.main]
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = data.azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  tags                     = var.default_tags
}

resource "azurerm_application_insights" "main" {
  name                = "${local.prefix}-appi"
  depends_on          = [data.azurerm_resource_group.main]
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  application_type    = "web"
  tags                = var.default_tags
}

resource "azurerm_app_service_plan" "main" {
  name                = "${local.prefix}-plan"
  depends_on          = [data.azurerm_resource_group.main]
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  tags                = var.default_tags

  sku {
    tier = "Free"
    size = "F1"
  }
}

resource "azurerm_function_app" "main" {
  name                       = "${local.prefix}-func"
  depends_on                 = [data.azurerm_resource_group.main, azurerm_application_insights.main]
  resource_group_name        = data.azurerm_resource_group.main.name
  location                   = data.azurerm_resource_group.main.location
  app_service_plan_id        = azurerm_app_service_plan.main.id
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  version                    = "~2"
  tags                       = var.default_tags
  https_only                 = true

  site_config {
    ftps_state = "FtpsOnly"
  }

  app_settings = {
    AppInsights_InstrumentationKey = azurerm_application_insights.main.instrumentation_key
    FUNCTIONS_WORKER_RUNTIME       = "node"
    FUNCTIONS_EXTENSION_VERSION    = "~2"
    WEBSITE_NODE_DEFAULT_VERSION   = "~10"
    AZURE_DEVOPS_USERNAME          = var.AZURE_DEVOPS_USERNAME
    AZURE_DEVOPS_PASSWORD          = var.AZURE_DEVOPS_PASSWORD
    AZURE_DEVOPS_ORGANIZATION      = var.AZURE_DEVOPS_ORGANIZATION
    AZURE_DEVOPS_PROJECT           = var.AZURE_DEVOPS_PROJECT
    GITLAB_WEBHOOK_SHARED_SECRET   = var.GITLAB_WEBHOOK_SHARED_SECRET
    GITLAB_PAT                     = var.GITLAB_PAT
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
  }

  lifecycle {
    ignore_changes = [
      app_settings["FUNCTIONS_EXTENSION_VERSION"],
    ]
  }

}

resource "null_resource" "zip_deploy" {
  depends_on = [azurerm_function_app.main]

  provisioner "local-exec" {
    command     = "./zip-deploy.sh"
    working_dir = "${path.module}/scripts"
    environment = {
      RESOURCE_NAME       = data.azurerm_resource_group.main.name
      FUNCTIONAPP_NAME    = azurerm_function_app.main.name
      ARM_SUBSCRIPTION_ID = data.azurerm_client_config.current.subscription_id
    }
  }
}

data "azurerm_client_config" "current" {}
