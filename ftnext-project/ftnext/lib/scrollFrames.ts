/**
 * Frame-sequence helpers for the scroll-scrubbed hero canvas.
 * See build spec Section 6.
 *
 * NOTE: sprite-sheet slicing (frame index -> { sheetIndex, offsetX, offsetY })
 * was proposed in the spec as a bandwidth optimization but no sprite sheets
 * exist in public/sprites/ yet — only 180 discrete frames in
 * public/frames/desktop/. This helper maps directly to those discrete
 * frames. Swap in sprite-sheet lookups here later without touching
 * ScrollCanvas.tsx if sprites get generated.
 */

export const TOTAL_FRAMES = 180;

// Roughly the first 15% of the sequence, per spec.
export const PRELOAD_COUNT = 25;

/**
 * Map a 0-1 scroll progress value to a 0-indexed frame index.
 */
export function progressToFrameIndex(progress: number): number {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const index = Math.round(clamped * (TOTAL_FRAMES - 1));
  return Math.min(index, TOTAL_FRAMES - 1);
}

/**
 * Get the public path for a given 0-indexed frame.
 * Files are named frame_0001.webp ... frame_0180.webp (1-indexed, 4-digit).
 */
export function getFramePath(index: number): string {
  const fileNumber = String(index + 1).padStart(4, '0');
  return `/frames/desktop/frame_${fileNumber}.webp`;
}
