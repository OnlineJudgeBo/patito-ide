import { initialExecution } from '@/store/ide-defaults';
import type { StoreSet } from '@/store/slices/types';
import type { ExecutionResult } from '@/types/ide';

export type ExecutionSlice = {
  execution: ExecutionResult;
  setExecution: (execution: Partial<ExecutionResult>) => void;
  addLog: (log: string) => void;
};

export function createExecutionSlice(set: StoreSet): ExecutionSlice {
  return {
    execution: initialExecution,
    setExecution: (execution) => set((state) => ({ execution: { ...state.execution, ...execution } })),
    addLog: (log) => set((state) => ({ execution: { ...state.execution, logs: [...state.execution.logs, log] } })),
  };
}
