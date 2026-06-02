'use client';

import { AnimatePresence } from 'framer-motion';
import { useToastMessage } from '@/hooks/use-toast';
import { Toast } from '@/components/ide/Toast';

export function ToastViewport() {
  const message = useToastMessage();

  return <AnimatePresence>{message ? <Toast message={message} /> : null}</AnimatePresence>;
}
