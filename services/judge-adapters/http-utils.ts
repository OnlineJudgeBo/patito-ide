import { requestJson } from '@/services/http-client';
import type { VibeApiConfig } from '@/types/ide';

export function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function fillPath(path: string, id: string) {
  return path.replace('{id}', encodeURIComponent(id));
}

export function endpoint(config: VibeApiConfig, path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  if (!config.apiBaseUrl) throw new Error('La URL base del API del juez no está configurada.');
  return `${trimTrailingSlash(config.apiBaseUrl)}${path}`;
}

export function authHeaders(launchToken?: string) {
  return launchToken ? { Authorization: `Bearer ${launchToken}` } : undefined;
}

export async function postJson<TResponse>(config: VibeApiConfig, path: string, payload: unknown, launchToken?: string) {
  return requestJson<TResponse>(endpoint(config, path), {
    method: 'POST',
    headers: authHeaders(launchToken),
    body: JSON.stringify(payload),
  });
}

export async function getJson<TResponse>(config: VibeApiConfig, path: string, launchToken?: string) {
  return requestJson<TResponse>(endpoint(config, path), { headers: authHeaders(launchToken) });
}

export function websocketUrl(config: VibeApiConfig, streamPath: string, submissionId: string) {
  if (config.features?.websocket === false || !config.wsBaseUrl) return undefined;
  return `${trimTrailingSlash(config.wsBaseUrl)}${fillPath(streamPath, submissionId)}`;
}
