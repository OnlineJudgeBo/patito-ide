'use client';

import { useCallback, type PointerEvent } from 'react';
import { clamp } from '@/lib/number';

type ResizeBounds = {
  readonly min: number;
  readonly max: number;
};

type VerticalResizeOptions = ResizeBounds & {
  readonly currentHeight: number;
  readonly onResize: (height: number) => void;
};

type HorizontalResizeOptions = ResizeBounds & {
  readonly currentWidth: number;
  readonly maxViewportRatio: number;
  readonly onResize: (width: number) => void;
};

function bindPointerResize(onMove: (event: globalThis.PointerEvent) => void) {
  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
}

export function useVerticalPanelResize({ currentHeight, min, max, onResize }: VerticalResizeOptions) {
  return useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const startY = event.clientY;
      const startHeight = currentHeight;

      bindPointerResize((moveEvent) => {
        onResize(clamp(startHeight - (moveEvent.clientY - startY), min, max));
      });
    },
    [currentHeight, max, min, onResize],
  );
}

export function useHorizontalPanelResize({ currentWidth, min, max, maxViewportRatio, onResize }: HorizontalResizeOptions) {
  return useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const startX = event.clientX;
      const startWidth = currentWidth;

      bindPointerResize((moveEvent) => {
        const viewportMax = Math.min(max, window.innerWidth * maxViewportRatio);
        onResize(clamp(startWidth + moveEvent.clientX - startX, min, viewportMax));
      });
    },
    [currentWidth, max, maxViewportRatio, min, onResize],
  );
}
