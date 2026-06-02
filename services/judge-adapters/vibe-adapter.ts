import { fillPath, getJson, postJson, websocketUrl } from '@/services/judge-adapters/http-utils';
import { normalizeRunResponse, normalizeStatusResponse, normalizeSubmitResponse } from '@/services/judge-response/normalizers';
import type { JudgeAdapterFactory } from '@/services/judge-adapters/types';
import type { SubmissionStatusMessage } from '@/types/ide';

export const createVibeAdapter: JudgeAdapterFactory = (config) => ({
  run: async (payload, launchToken) => normalizeRunResponse(await postJson<unknown>(config, config.paths?.run ?? '/vibe/runs', payload, launchToken)),
  runStatus: async (runId, launchToken): Promise<SubmissionStatusMessage> => {
    const path = fillPath(config.paths?.runStatus ?? '/vibe/runs/{id}', runId);
    return normalizeStatusResponse(runId, await getJson<unknown>(config, path, launchToken));
  },
  submit: async (payload, launchToken) => normalizeSubmitResponse(await postJson<unknown>(config, config.paths?.submit ?? '/vibe/submissions', payload, launchToken)),
  submissionStatus: async (submissionId, launchToken): Promise<SubmissionStatusMessage> => {
    const path = fillPath(config.paths?.submissionStatus ?? '/vibe/submissions/{id}', submissionId);
    return normalizeStatusResponse(submissionId, await getJson<unknown>(config, path, launchToken));
  },
  streamUrl: (submissionId) => websocketUrl(config, config.paths?.submissionStream ?? '/vibe/submissions/{id}/events', submissionId),
});
