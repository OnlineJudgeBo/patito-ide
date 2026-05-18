'use client';

import { useEffect } from 'react';

export function useKeyboardShortcuts(actions: { run: () => void; submit: () => void; save: () => void }) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) return;

      if (event.key === 'Enter' && event.shiftKey) {
        event.preventDefault();
        actions.submit();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        actions.run();
      } else if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        actions.save();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
