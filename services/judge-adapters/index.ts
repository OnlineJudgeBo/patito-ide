import { createMockAdapter } from '@/services/judge-adapters/mock-adapter';
import type { JudgeAdapter } from '@/services/judge-adapters/types';
import { createVibeAdapter } from '@/services/judge-adapters/vibe-adapter';
import type { VibeApiConfig } from '@/types/ide';

export function createJudgeAdapter(config: VibeApiConfig): JudgeAdapter {
  if (config.adapter === 'mock') return createMockAdapter(config);
  return createVibeAdapter(config);
}
