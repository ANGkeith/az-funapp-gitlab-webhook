const { validatePipelineId, validateSecret, validateMergeRequestState } = require('./validator');
const { triggerPipeline, sendPendingStatus } = require('./utils');

module.exports = async function (context, req) {
    if (req.method === 'GET') {
        context.res = {
            body: 'Server is healthy',
        };
        return;
    }
    const { pipelineId } = req.query;

    if (!validateSecret(context, req)) return;
    if (!validatePipelineId(context, pipelineId)) return;
    if (!validateMergeRequestState(context, req)) return;

    await sendPendingStatus(context, req);
    await triggerPipeline(req, pipelineId, context);
};
