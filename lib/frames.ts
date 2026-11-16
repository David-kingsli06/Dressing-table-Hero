export const TOTAL_FRAMES = 240;

/**
 * Returns the zero-padded 3-digit frame filename path, e.g. /frames/frame_042.webp
 */
export function getFramePath(index: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  const padded = clamped.toString().padStart(3, "0");
  return `/frames/frame_${padded}.webp`;
}

/**
 * Maps scroll progress p in [0, 1] to frame index [0, 239].
 * For low-spec devices (concurrency < 4), optionally rounds to even frames.
 */
export function getFrameIndexFromProgress(p: number, lowEndMode: boolean = false): number {
  const clampedProgress = Math.max(0, Math.min(1, p));
  let frame = Math.round(clampedProgress * (TOTAL_FRAMES - 1));

  if (lowEndMode) {
    frame = Math.round(frame / 2) * 2;
    if (frame >= TOTAL_FRAMES) {
      frame = TOTAL_FRAMES - 2;
    }
  }

  return frame;
}

/**
 * Preload all images and decode them.
 * Calls onProgress(loadedCount, totalCount) as each frame successfully loads/decodes.
 */
export function preloadFrames(
  onProgress?: (loaded: number, total: number) => void
): Promise<HTMLImageElement[]> {
  const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);
  let loadedCount = 0;

  return new Promise((resolve) => {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);

      const onLoad = async () => {
        try {
          if ("decode" in img) {
            await img.decode();
          }
        } catch {
          // Decode error or abort fallback
        }
        loadedCount++;
        onProgress?.(loadedCount, TOTAL_FRAMES);
        if (loadedCount === TOTAL_FRAMES) {
          resolve(images);
        }
      };

      img.onload = onLoad;
      img.onerror = () => {
        loadedCount++;
        onProgress?.(loadedCount, TOTAL_FRAMES);
        if (loadedCount === TOTAL_FRAMES) {
          resolve(images);
        }
      };

      images[i] = img;
    }
  });
}
