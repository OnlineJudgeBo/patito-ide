import { requestJson } from '@/services/http-client';
import { getRuntimeConfig } from '@/services/runtime-config';
import { normalizeAllowedLanguages, normalizeProblem } from '@/services/vibe-context-normalizer';
import type { AllowedLanguageValue, ApiLanguageDefinition, JudgeFeatures, ProblemStatement } from '@/types/ide';

export type VibeLaunchContext = {
  readonly token?: string;
  readonly problem: ProblemStatement;
  readonly allowedLanguages?: readonly AllowedLanguageValue[];
  readonly languageDefinitions?: readonly ApiLanguageDefinition[];
  readonly languages?: readonly ApiLanguageDefinition[];
  readonly features?: JudgeFeatures;
  readonly identifiers?: {
    readonly problemId?: number | string;
    readonly contestId?: number | string;
    readonly num?: number;
    readonly languageId?: number | string;
    readonly languageName?: string;
  };
};

export type VibeLaunchContextRequest = {
  readonly token?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

function appendQuery(url: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

export async function fetchVibeLaunchContext(request: VibeLaunchContextRequest): Promise<VibeLaunchContext> {
  const config = await getRuntimeConfig();
  const contextEndpoint = config.contextUrl ?? `${trimTrailingSlash(config.apiBaseUrl ?? '')}${config.paths?.context ?? '/vibe/context'}`;
  if (!contextEndpoint || contextEndpoint === '/vibe/context') throw new Error('Judge context API URL is not configured.');

  const url = appendQuery(contextEndpoint, {
    token: request.token,
  });
  const response = await requestJson<Omit<VibeLaunchContext, 'token'>>(url, {
    headers: request.token ? { Authorization: `Bearer ${request.token}` } : undefined,
  });

  return {
    ...response,
    problem: normalizeProblem(response.problem),
    languageDefinitions: response.languageDefinitions ?? response.languages,
    allowedLanguages: normalizeAllowedLanguages(response.allowedLanguages),
    token: request.token,
  };
}
