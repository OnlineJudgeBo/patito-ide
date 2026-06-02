'use client';

import { createElement, useEffect, useMemo, useRef } from 'react';
import { toSafeRichHtml } from '@/lib/rich-content';
import { getRuntimeConfig } from '@/services/runtime-config';

declare global {
  interface Window {
    MathJax?: {
      tex?: unknown;
      options?: unknown;
      startup?: {
        promise?: Promise<unknown>;
      };
      typesetClear?: (elements?: HTMLElement[]) => void;
      typesetPromise?: (elements?: HTMLElement[]) => Promise<unknown>;
    };
  }
}

const MATHJAX_SCRIPT_ID = 'vibe-mathjax-script';
const DEFAULT_MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
let mathJaxReady: Promise<void> | undefined;

async function ensureMathJax(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.MathJax?.typesetPromise) return Promise.resolve();
  if (mathJaxReady) return mathJaxReady;

  const config = await getRuntimeConfig();
  if (config.mathJax?.enabled === false) return Promise.resolve();
  const mathJaxSrc = config.mathJax?.src || DEFAULT_MATHJAX_SRC;

  mathJaxReady = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(MATHJAX_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      window.MathJax?.startup?.promise?.then(() => resolve()).catch(reject) ?? resolve();
      return;
    }

    window.MathJax = {
      tex: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)'],
        ],
        displayMath: [
          ['$$', '$$'],
          ['\\[', '\\]'],
        ],
        processEscapes: true,
        processEnvironments: true,
      },
      options: {
        skipHtmlTags: ['script', 'noscript', 'style', 'textarea'],
      },
    };

    const script = document.createElement('script');
    script.id = MATHJAX_SCRIPT_ID;
    script.src = mathJaxSrc;
    script.async = true;
    script.onload = () => {
      window.MathJax?.startup?.promise?.then(() => resolve()).catch(reject) ?? resolve();
    };
    script.onerror = () => reject(new Error('No se pudo cargar MathJax.'));
    document.head.appendChild(script);
  });

  return mathJaxReady;
}

type MathJaxContentProps = {
  readonly value: string;
  readonly as?: 'p' | 'div' | 'pre';
  readonly className?: string;
};

export function MathJaxContent({ value, as = 'div', className }: MathJaxContentProps) {
  const ref = useRef<HTMLElement | null>(null);
  const html = useMemo(() => toSafeRichHtml(value), [value]);

  useEffect(() => {
    let cancelled = false;
    const element = ref.current;
    if (!element) return undefined;

    window.MathJax?.typesetClear?.([element]);
    element.innerHTML = html;

    ensureMathJax()
      .then(() => {
        if (cancelled || ref.current !== element) return undefined;
        window.MathJax?.typesetClear?.([element]);
        return new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => {
            if (cancelled || ref.current !== element) {
              resolve();
              return;
            }
            window.MathJax?.typesetPromise?.([element]).then(() => resolve()).catch(() => resolve());
          });
        });
      })
      .catch((error: unknown) => {
        console.warn('[vibe-mathjax] render failed', error);
      });

    return () => {
      cancelled = true;
    };
  }, [html]);

  return createElement(as, {
    ref,
    className: `rich-content whitespace-pre-wrap break-words ${className ?? ''}`,
  });
}
