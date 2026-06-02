import type { ContextSlice } from '@/store/slices/context-slice';
import type { ExecutionSlice } from '@/store/slices/execution-slice';
import type { LanguageCodeSlice } from '@/store/slices/language-code-slice';
import type { TestcaseSlice } from '@/store/slices/testcase-slice';
import type { UiSlice } from '@/store/slices/ui-slice';

export type IDEState = LanguageCodeSlice & ContextSlice & ExecutionSlice & TestcaseSlice & UiSlice;
