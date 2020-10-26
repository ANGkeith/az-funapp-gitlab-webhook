const axios = require('axios');

const { gitlabApiVersion, organization, project, azureDevopsApiVersion, azureDevopsUsername, azureDevopsPassword, gitlabPAT } = require('./constant');

const getGitlabBaseUrl = (payload) => {
    return new URL(payload.project.web_url).origin;
};

const postBuildStatusEndpoint = (payload) => {
    const baseUrl = getGitlabBaseUrl(payload);
    const projectId = payload.project.id;
    const buildStatusCommitSha = payload.object_attributes.last_commit.id;
    return `${baseUrl}/api/${gitlabApiVersion}/projects/${projectId}/statuses/${buildStatusCommitSha}`;
};

const triggerBuildEndpoint = `https://dev.azure.com/${organization}/${project}/_apis/build/builds?api-version=${azureDevopsApiVersion}`;

const credential = (() => {
    return Buffer.from(`${azureDevopsUsername}:${azureDevopsPassword}`).toString('base64');
})();

const getSourceBranch = (req) => req.body.object_attributes.source_branch;

const generateParameters = (req) => {
    const payload = req.body;
    return JSON.stringify({
        SOURCE_BRANCH: payload.object_attributes.source_branch,
        TARGET_BRANCH: payload.object_attributes.target_branch,
        GITLAB_BUILD_STATUS_ENDPOINT: postBuildStatusEndpoint(payload),
        GITLAB_MR_STATE: payload.object_attributes.state,
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
        sourceBranch: getSourceBranch(req),
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

const sendPendingStatus = async (req) => {
    await axios.request({
        method: 'POST',
        url: `${postBuildStatusEndpoint(req.body)}?state=pending&name=azureDevops`,
        headers: {
            "private-token": gitlabPAT,
        },
    })
}

module.exports = {
    triggerPipeline,
    sendPendingStatus,
};
