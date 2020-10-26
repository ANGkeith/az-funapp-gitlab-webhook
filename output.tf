output "webhook_url" {
    value = "https://${azurerm_function_app.main.default_hostname}/api/GitLabWebHookTrigger?pipelineId={{pipelineId}}"
}
