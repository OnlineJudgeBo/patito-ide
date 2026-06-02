import type { StoreApi } from 'zustand';
import type { IDEState } from '@/store/ide-state';

export type StoreSet = StoreApi<IDEState>['setState'];
export type StoreGet = StoreApi<IDEState>['getState'];
