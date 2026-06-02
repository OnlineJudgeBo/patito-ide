import type { VibeApiConfig } from '@/types/ide';

let cachedConfig: Promise<VibeApiConfig> | undefined;

function basePath() {
  const value = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  if (!value || value === '/') return '';
  return `/${value.replace(/^\/+|\/+$/g, '')}`;
}

function envConfig(): VibeApiConfig {
  return {
    adapter: (process.env.NEXT_PUBLIC_JUDGE_ADAPTER as VibeApiConfig['adapter']) ?? 'vibe',
    apiBaseUrl: process.env.NEXT_PUBLIC_JUDGE_API_URL,
    wsBaseUrl: process.env.NEXT_PUBLIC_JUDGE_WS_URL,
    contextUrl: process.env.NEXT_PUBLIC_VIBE_IDE_CONTEXT_URL,
    features: {
      run: process.env.NEXT_PUBLIC_JUDGE_RUN_ENABLED !== 'false',
      submit: process.env.NEXT_PUBLIC_JUDGE_SUBMIT_ENABLED !== 'false',
      websocket: process.env.NEXT_PUBLIC_JUDGE_WS_ENABLED !== 'false',
      polling: process.env.NEXT_PUBLIC_JUDGE_POLLING_ENABLED !== 'false',
      lsp: process.env.NEXT_PUBLIC_LSP_ENABLED !== 'false',
    },
    mathJax: {
      enabled: process.env.NEXT_PUBLIC_MATHJAX_ENABLED !== 'false',
      src: process.env.NEXT_PUBLIC_MATHJAX_SRC,
    },
    pollingIntervalMs: Number(process.env.NEXT_PUBLIC_JUDGE_POLLING_INTERVAL_MS ?? 1500),
  };
}

async function fetchRuntimeConfig(): Promise<Partial<VibeApiConfig>> {
  try {
    const response = await fetch(`${basePath()}/vibe-config.json`, { cache: 'no-store' });
    if (!response.ok) return {};
    return (await response.json()) as Partial<VibeApiConfig>;
  } catch {
    return {};
  }
}

function mergeConfig(base: VibeApiConfig, override: Partial<VibeApiConfig>): VibeApiConfig {
  return {
    ...base,
    ...override,
    paths: { ...base.paths, ...override.paths },
    features: { ...base.features, ...override.features },
  };
}

export function getRuntimeConfig(): Promise<VibeApiConfig> {
  cachedConfig ??= fetchRuntimeConfig().then((runtimeConfig) => mergeConfig(envConfig(), runtimeConfig));
  return cachedConfig;
}

export function resetRuntimeConfigCache() {
  cachedConfig = undefined;
}
