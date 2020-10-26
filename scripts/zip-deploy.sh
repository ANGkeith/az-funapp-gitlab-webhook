#!/usr/bin/env bash

set -o verbose
set -o errexit
set -o pipefail
set -o nounset

script_directory=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)
root_directory=$(dirname "$script_directory")

cd "${root_directory}"/src

echo 'Installing node_modules ...'
yarn install --frozen-lockfiles

echo 'Zipping src ...'
zip -r /tmp/gitlab-webhook.zip ./

echo 'Deploying function app ...'
az functionapp deployment source config-zip \
    --resource-group "${RESOURCE_NAME}" \
    --name "${FUNCTIONAPP_NAME}" \
    --subscription "${ARM_SUBSCRIPTION_ID}" \
    --src /tmp/gitlab-webhook.zip
