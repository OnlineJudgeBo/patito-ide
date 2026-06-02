'use client';

import { useCallback, useEffect, useState } from 'react';
import { TOAST_TIMEOUT_MS } from '@/lib/ui-config';

type ToastListener = (message: string) => void;

const toastListeners = new Set<ToastListener>();
let toastTimeout: number | undefined;

function emitToast(message: string) {
  for (const listener of toastListeners) listener(message);
}

function showToast(message: string, timeoutMs: number) {
  window.clearTimeout(toastTimeout);
  emitToast(message);
  toastTimeout = window.setTimeout(() => emitToast(''), timeoutMs);
}

export function useToast(timeoutMs = TOAST_TIMEOUT_MS) {
  const notify = useCallback(
    (nextMessage: string) => {
      showToast(nextMessage, timeoutMs);
    },
    [timeoutMs],
  );

  return { notify } as const;
}

export function useToastMessage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    toastListeners.add(setMessage);
    return () => {
      toastListeners.delete(setMessage);
    };
  }, []);

  return message;
}
