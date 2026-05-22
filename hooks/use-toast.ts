'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TOAST_TIMEOUT_MS } from '@/lib/ui-config';

export function useToast(timeoutMs = TOAST_TIMEOUT_MS) {
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<number | undefined>(undefined);

  const notify = useCallback(
    (nextMessage: string) => {
      window.clearTimeout(timeoutRef.current);
      setMessage(nextMessage);
      timeoutRef.current = window.setTimeout(() => setMessage(''), timeoutMs);
    },
    [timeoutMs],
  );

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return { message, notify } as const;
}
