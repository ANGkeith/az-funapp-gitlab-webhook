const { secret } = require('./constant');
const { secretTokenHeaderName } = require('./constant');

const validateSecret = (context, req) => {
    if (req.headers[secretTokenHeaderName] === secret) return true;

    context.res = {
        status: 401,
        body: 'Unauthorized',
    };
    return false;
};

const validatePipelineId = (context, pipelineId) => {
    if (pipelineId && !isNaN(pipelineId)) return true;

    context.res = {
        status: 422,
        body: 'queryParam pipelineId must be a number and is required',
    };
    return false;
};

const validateMergeRequestState = (context, req) => {
    const mergeRequestState = req.body.object_attributes.state;
    if (mergeRequestState === 'opened' || mergeRequestState === 'merged') return true;

    context.res = {
        status: 200,
        body: `Nothing was done because the merge request state is \`${mergeRequestState}\``,
    };
    return false;
};

module.exports = {
    validateSecret,
    validatePipelineId,
    validateMergeRequestState
};
