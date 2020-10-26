const secret = process.env.GITLAB_WEBHOOK_SHARED_SECRET;
const secretTokenHeaderName = 'x-gitlab-token';
const azureDevopsUsername = process.env.AZURE_DEVOPS_USERNAME;
const azureDevopsPassword = process.env.AZURE_DEVOPS_PASSWORD;
const azureDevopsApiVersion = '6.0';
const organization = process.env.AZURE_DEVOPS_ORGANIZATION;
const project = process.env.AZURE_DEVOPS_PROJECT;
const gitlabApiVersion = 'v4';
const gitlabPAT = process.env.GITLAB_PAT;

module.exports = {
    gitlabApiVersion,
    secret,
    secretTokenHeaderName,
    gitlabPAT,
    azureDevopsApiVersion,
    azureDevopsPassword,
    azureDevopsUsername,
    organization,
    project
};
