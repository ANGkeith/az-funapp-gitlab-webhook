const axios = require('axios');

const { gitlabApiVersion, organization, project, azureDevopsApiVersion, azureDevopsUsername, azureDevopsPassword, gitlabPAT } = require('./constant');

const getGitlabBaseUrl = (payload) => {
    return new URL(payload.project.web_url).origin;
};

const postBuildStatusEndpoint = (payload) => {
    const baseUrl = getGitlabBaseUrl(payload);
    const projectId = payload.project.id;
    const buildStatusCommitSha = payload.object_attributes.last_commit.id;
    return `${baseUrl}:4443/api/${gitlabApiVersion}/projects/${projectId}/statuses/${buildStatusCommitSha}`;
};

const triggerBuildEndpoint = `https://dev.azure.com/${organization}/${project}/_apis/build/builds?api-version=${azureDevopsApiVersion}`;

const credential = (() => {
    return Buffer.from(`${azureDevopsUsername}:${azureDevopsPassword}`).toString('base64');
})();

const getSourceBranch = (req) => req.body.object_attributes.source_branch;
const getTargetBranch = (req) => req.body.object_attributes.target_branch;

// information to be forwarded to the AzureDevops Pipeline
const generateParameters = (req) => {
    const payload = req.body;
    return JSON.stringify({
        SOURCE_BRANCH: getSourceBranch(req),
        TARGET_BRANCH: getTargetBranch(req),
        GITLAB_BUILD_STATUS_ENDPOINT: postBuildStatusEndpoint(payload),
        GITLAB_MR_STATE: payload.object_attributes.state,
        GITLAB_MR_ID: payload.object_attributes.iid,
        GITLAB_PAT: gitlabPAT,
        GITLAB_PREVIOUS_BUILD_SHA: payload.object_attributes.oldrev,
    });
};

const triggerPipeline = async (req, pipelineId, context) => {
    const data = {
        definition: {
            id: pipelineId,
        },
        reason: 'individualCI',
        sourceBranch: mrIsMerged(req) ? getTargetBranch(req) : getSourceBranch(req),
        parameters: `${generateParameters(req)}`,
    };

    context.log(data);
    await axios
        .request({
            method: 'POST',
            url: triggerBuildEndpoint,
            headers: {
                'content-type': 'application/json',
                authorization: `Basic ${credential}`,
            },
            data,
        })
        .catch((e) => {
            context.log(e.response);
            context.res = {
                status: e.response.status,
            };
        });
};

const sendPendingStatus = async (context, req) => {
    if (mrIsMerged(req)) return;
    await axios.request({
        method: 'POST',
        url: `${postBuildStatusEndpoint(req.body)}?state=pending&name=azureDevops`,
        headers: {
            "private-token": gitlabPAT,
        },
    })
    .catch((e) => {
        context.log(e.response);
        context.res = {
            body: {
                message: "Failed to send pending status",
                error_message: e.response.data
            }
        };
    })
}

const mrIsMerged = (req) => req.body.object_attributes.state === 'merged'

module.exports = {
    triggerPipeline,
    sendPendingStatus,
};
